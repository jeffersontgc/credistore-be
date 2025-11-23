import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../../users/services/users.service';
import { ProductsService } from '../../products/services/productos.service';
import { DebtItem } from '../entities/debts-item.entity';
import { Debts, DebtsStatus } from '../entities/debts.entity';

import { PaginatedDebts } from '../dto/paginated-debts.output';
import { CreateDebtInput } from 'src/debts/dto/create-debts.input';
import { FilterDebtInput } from 'src/debts/dto/filter-debts.input';

@Injectable()
export class DebtsService {
  private readonly logger = new Logger(DebtsService.name);

  constructor(
    @InjectRepository(Debts)
    private readonly debtsRepository: Repository<Debts>,
    @InjectRepository(DebtItem)
    private readonly debtItemsRepository: Repository<DebtItem>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new debt with transaction support
   * @param createDebtInput Debt creation data
   * @returns Created debt
   */
  async create(args: CreateDebtInput): Promise<Debts> {
    this.logger.log(
      `Creating new debt for user ${args.user_uuid} with ${args.products.length} products`,
    );

    // Validate payment date is in the future
    const now = new Date();
    const datePay = new Date(args.dueDate);
    if (datePay < now) {
      throw new BadRequestException('Payment date must be in the future');
    }

    // Use transaction to ensure data consistency
    return await this.debtsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Find and validate user
        const user = await this.usersService.findByUuid(args.user_uuid);

        if (!user) {
          throw new NotFoundException(
            `User with ID ${args.user_uuid} not found`,
          );
        }

        // Check if user is delinquent
        if (user.isDelinquent) {
          this.logger.warn(`Creating debt for delinquent user: ${user.uuid}`);
        }

        // Validate and process products
        const debtItems: DebtItem[] = [];
        let totalAmount = 0;
        const productUuids = args.products.map((p) => p.product_uuid);

        // Check for duplicate products in the request
        const duplicates = productUuids.filter(
          (item, index) => productUuids.indexOf(item) !== index,
        );
        if (duplicates.length > 0) {
          throw new BadRequestException(
            `Duplicate products found in request: ${duplicates.join(', ')}`,
          );
        }

        // Process each product
        for (const productInput of args.products) {
          // Validate quantity
          if (productInput.quantity <= 0) {
            throw new BadRequestException(
              'Product quantity must be greater than 0',
            );
          }

          // Get product
          const product = await this.productsService.findByUuid(
            productInput.product_uuid,
          );

          // Check stock availability before decreasing
          const hasStock = await this.productsService.hasStock(
            product.uuid,
            productInput.quantity,
          );

          if (!hasStock) {
            throw new BadRequestException(
              `Insufficient stock for product "${product.name}"`,
            );
          }

          // Decrease stock (uses pessimistic locking)
          await this.productsService.decreaseStock(
            product.uuid,
            productInput.quantity,
          );

          // Calculate subtotal
          const price = Number(product.price);
          const subtotal = price * productInput.quantity;
          totalAmount += subtotal;

          // Create debt item
          const debtItem = this.debtItemsRepository.create({
            uuid: uuidv4(),
            product,
            quantity: productInput.quantity,
            price,
          });

          debtItems.push(debtItem);
        }

        // Validate total amount
        if (totalAmount <= 0) {
          throw new BadRequestException(
            'Debt total amount must be greater than 0',
          );
        }

        // Create debt
        const debt = this.debtsRepository.create({
          uuid: uuidv4(),
          user,
          date_pay: args.dueDate,
          amount: totalAmount,
          status: DebtsStatus.ACTIVE,
          products: debtItems,
        });

        const saved = await transactionalEntityManager.save(debt);
        this.logger.log(
          `Debt created successfully with UUID: ${saved.uuid}, Amount: ${totalAmount}`,
        );

        // Return with relations
        const createdDebt = await this.findOne(saved.id);

        // Emit event for reports
        this.eventEmitter.emit('reports-sales.debt-created', {
          debt: createdDebt,
        });

        return createdDebt;
      },
    );
  }

  /**
   * Find all debts with pagination and filters
   * @param filters Filter and pagination options
   * @returns Paginated debts
   */
  async findAll(filters: FilterDebtInput = {}): Promise<PaginatedDebts> {
    const {
      user_uuid,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filters;

    this.logger.log(`Finding debts with filters: ${JSON.stringify(filters)}`);

    const queryBuilder = this.debtsRepository
      .createQueryBuilder('debt')
      .leftJoinAndSelect('debt.user', 'user')
      .leftJoinAndSelect('debt.products', 'items')
      .leftJoinAndSelect('items.product', 'product');

    // Apply filters
    if (user_uuid) {
      queryBuilder.andWhere('user.uuid = :user_uuid', { user_uuid });
    }

    if (status) {
      queryBuilder.andWhere('debt.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('debt.date_pay BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('debt.date_pay >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('debt.date_pay <= :endDate', { endDate });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get total amount for all debts (without pagination)
    const amountResult = await queryBuilder
      .select('SUM(debt.amount)', 'total')
      .getRawOne();
    const totalAmount = parseFloat(amountResult?.total || '0');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit).orderBy('debt.createdAt', 'DESC');

    const data = await queryBuilder.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalAmount,
    };
  }

  /**
   * Find one debt by ID
   * @param id Debt ID
   * @returns Debt with all relations
   */
  async findOne(id: number): Promise<Debts> {
    this.logger.log(`Finding debt with ID: ${id}`);

    const debt = await this.debtsRepository.findOne({
      where: { id },
      relations: ['user', 'products', 'products.product'],
    });

    if (!debt) {
      throw new NotFoundException(`Debt with ID ${id} not found`);
    }

    return debt;
  }

  /**
   * Find one debt by UUID
   * @param uuid Debt UUID
   * @returns Debt with all relations
   */
  async findByUuid(uuid: string): Promise<Debts> {
    this.logger.log(`Finding debt with UUID: ${uuid}`);

    const debt = await this.debtsRepository.findOne({
      where: { uuid },
      relations: ['user', 'products', 'products.product'],
    });

    if (!debt) {
      throw new NotFoundException(`Debt with UUID ${uuid} not found`);
    }

    return debt;
  }

  /**
   * Find debts by user UUID
   * @param user_uuid User UUID
   * @returns User's debts
   */
  async findByUser(user_uuid: string): Promise<Debts[]> {
    this.logger.log(`Finding debts for user: ${user_uuid}`);

    return this.debtsRepository.find({
      where: { user: { uuid: user_uuid } },
      relations: ['user', 'products', 'products.product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update debt status
   * @param id Debt ID
   * @param status New status
   * @returns Updated debt
   */
  async updateStatus(uuid: string, status: DebtsStatus): Promise<Debts> {
    this.logger.log(`Updating debt ${uuid} status to: ${status}`);

    const debt = await this.findByUuid(uuid);

    // Validate status transition
    this.validateStatusTransition(debt.status, status);

    const previousStatus = debt.status;
    debt.status = status;
    const updated = await this.debtsRepository.save(debt);

    this.logger.log(`Debt ${uuid} status updated successfully`);

    // Emit event for reports
    this.eventEmitter.emit('reports-sales.debt-status-updated', {
      debt: updated,
      previousStatus,
    });

    return updated;
  }

  /**
   * Get overdue debts
   * @returns Overdue debts
   */
  async getOverdueDebts(): Promise<Debts[]> {
    this.logger.log('Finding overdue debts');

    const now = new Date();

    return this.debtsRepository.find({
      where: {
        status: In([DebtsStatus.ACTIVE, DebtsStatus.PENDING]),
        date_pay: Between(new Date('1970-01-01'), now),
      },
      relations: ['user', 'products', 'products.product'],
      order: { date_pay: 'ASC' },
    });
  }

  /**
   * Get debt statistics for a user
   * @param user_uuid User UUID
   * @returns User debt statistics
   */
  async getUserDebtStats(user_uuid: string): Promise<{
    totalDebts: number;
    activeDebts: number;
    paidDebts: number;
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
  }> {
    this.logger.log(`Getting debt statistics for user: ${user_uuid}`);

    const debts = await this.findByUser(user_uuid);

    const stats = {
      totalDebts: debts.length,
      activeDebts: debts.filter(
        (d) =>
          d.status === DebtsStatus.ACTIVE || d.status === DebtsStatus.PENDING,
      ).length,
      paidDebts: debts.filter(
        (d) =>
          d.status === DebtsStatus.PAID || d.status === DebtsStatus.SETTLED,
      ).length,
      totalAmount: debts.reduce((sum, d) => sum + Number(d.amount), 0),
      totalPaid: debts
        .filter(
          (d) =>
            d.status === DebtsStatus.PAID || d.status === DebtsStatus.SETTLED,
        )
        .reduce((sum, d) => sum + Number(d.amount), 0),
      totalPending: debts
        .filter(
          (d) =>
            d.status === DebtsStatus.ACTIVE || d.status === DebtsStatus.PENDING,
        )
        .reduce((sum, d) => sum + Number(d.amount), 0),
    };

    return stats;
  }

  /**
   * Cancel a debt and restore stock
   * @param id Debt ID
   */
  async cancelDebt(id: number): Promise<void> {
    this.logger.log(`Canceling debt: ${id}`);

    await this.debtsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const debt = await this.findOne(id);

        // Only allow canceling active or pending debts
        if (
          debt.status !== DebtsStatus.ACTIVE &&
          debt.status !== DebtsStatus.PENDING
        ) {
          throw new BadRequestException(
            `Cannot cancel debt with status: ${debt.status}`,
          );
        }

        // Restore stock for all products
        for (const item of debt.products) {
          await this.productsService.increaseStock(
            item.product.uuid,
            item.quantity,
          );
        }

        // Emit event for reports before deleting
        this.eventEmitter.emit('reports-sales.debt-cancelled', {
          debt,
        });

        // Delete debt
        await transactionalEntityManager.remove(debt);

        this.logger.log(`Debt ${id} canceled and stock restored`);
      },
    );
  }

  /**
   * Validate status transition
   * @param currentStatus Current debt status
   * @param newStatus New debt status
   */
  private validateStatusTransition(
    currentStatus: DebtsStatus,
    newStatus: DebtsStatus,
  ): void {
    const validTransitions: Record<DebtsStatus, DebtsStatus[]> = {
      [DebtsStatus.ACTIVE]: [
        DebtsStatus.PENDING,
        DebtsStatus.PAID,
        DebtsStatus.SETTLED,
      ],
      [DebtsStatus.PENDING]: [DebtsStatus.PAID, DebtsStatus.SETTLED],
      [DebtsStatus.PAID]: [DebtsStatus.SETTLED],
      [DebtsStatus.SETTLED]: [], // Final state
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
