import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateProductInput } from '../dto/create-producto.input';
import { UpdateProductInput } from '../dto/update-producto.input';
import { FilterProductInput } from '../dto/filter-producto.input';
import { PaginatedProducts } from '../dto/paginated-products.output';
import { Products } from '../entities/products.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly LOW_STOCK_THRESHOLD = 10;

  constructor(
    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,
  ) {}

  /**
   * Create a new product
   * @param createProductInput Product data
   * @returns Created product
   */
  async create(createProductInput: CreateProductInput): Promise<Products> {
    this.logger.log(`Creating new product: ${createProductInput.name}`);

    // Check for duplicate product name
    const existingProduct = await this.productsRepository.findOne({
      where: { name: createProductInput.name },
    });

    if (existingProduct) {
      throw new ConflictException(
        `Product with name "${createProductInput.name}" already exists`,
      );
    }

    // Validate price
    if (createProductInput.price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    // Validate stock
    if (createProductInput.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    const product = this.productsRepository.create({
      ...createProductInput,
      uuid: uuidv4(),
    });

    const saved = await this.productsRepository.save(product);
    this.logger.log(`Product created successfully with UUID: ${saved.uuid}`);

    return saved;
  }

  /**
   * Find all products with pagination and filters
   * @param filters Filter and pagination options
   * @returns Paginated products
   */
  async findAll(args: FilterProductInput = {}): Promise<PaginatedProducts> {
    const { search, type, page = 1, limit = 10, lowStock } = args;

    this.logger.log(`Finding products with filters: ${JSON.stringify(args)}`);

    const queryBuilder = this.productsRepository.createQueryBuilder('product');

    // Apply search filter
    if (search) {
      queryBuilder.where('LOWER(product.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    // Apply type filter
    if (type) {
      queryBuilder.andWhere('product.type = :type', { type });
    }

    // Apply low stock filter
    if (lowStock) {
      queryBuilder.andWhere('product.stock < :threshold', {
        threshold: this.LOW_STOCK_THRESHOLD,
      });
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit).orderBy('product.createdAt', 'DESC');

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
    };
  }

  /**
   * Find one product by UUID (PUBLIC METHOD)
   * @param uuid Product UUID
   * @returns Product
   */
  async findByUuid(uuid: string): Promise<Products> {
    this.logger.log(`Finding product with UUID: ${uuid}`);

    const product = await this.productsRepository.findOne({
      where: { uuid },
    });

    if (!product) {
      throw new NotFoundException(`Product with UUID ${uuid} not found`);
    }

    return product;
  }

  /**
   * Update a product by UUID
   * @param updateProductInput Update data
   * @returns Updated product
   */
  async update(updateProductInput: UpdateProductInput): Promise<Products> {
    const { uuid, ...updateData } = updateProductInput;

    this.logger.log(`Updating product with UUID: ${uuid}`);

    const product = await this.findByUuid(uuid);

    // If name is being updated, check for duplicates
    if (updateData.name && updateData.name !== product.name) {
      const existingProduct = await this.productsRepository.findOne({
        where: { name: updateData.name },
      });

      if (existingProduct) {
        throw new ConflictException(
          `Product with name "${updateData.name}" already exists`,
        );
      }
    }

    // Validate price if provided
    if (updateData.price !== undefined && updateData.price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    // Validate stock if provided
    if (updateData.stock !== undefined && updateData.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    Object.assign(product, updateData);
    const updated = await this.productsRepository.save(product);

    this.logger.log(`Product updated successfully: ${updated.uuid}`);
    return updated;
  }

  /**
   * Delete a product by UUID
   * @param uuid Product UUID
   */
  async remove(uuid: string): Promise<void> {
    this.logger.log(`Removing product with UUID: ${uuid}`);

    const product = await this.findByUuid(uuid);
    await this.productsRepository.remove(product);

    this.logger.log(`Product removed successfully: ${uuid}`);
  }

  /**
   * Decrease stock for a product by UUID (transactional)
   * @param uuid Product UUID
   * @param quantity Quantity to decrease
   * @returns Updated product
   */
  async decreaseStock(uuid: string, quantity: number): Promise<Products> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    this.logger.log(`Decreasing stock for product ${uuid} by ${quantity}`);

    return await this.productsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Lock the row for update to prevent race conditions
        const product = await transactionalEntityManager.findOne(Products, {
          where: { uuid },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(`Product with UUID ${uuid} not found`);
        }

        if (product.stock < quantity) {
          throw new BadRequestException(
            `Insufficient stock for product "${product.name}". ` +
              `Available: ${product.stock}, Requested: ${quantity}`,
          );
        }

        product.stock -= quantity;
        const updated = await transactionalEntityManager.save(product);

        // Log warning if stock is low
        if (updated.stock < this.LOW_STOCK_THRESHOLD) {
          this.logger.warn(
            `Low stock alert for product "${updated.name}": ${updated.stock} units remaining`,
          );
        }

        return updated;
      },
    );
  }

  /**
   * Increase stock for a product by UUID
   * @param uuid Product UUID
   * @param quantity Quantity to increase
   * @returns Updated product
   */
  async increaseStock(uuid: string, quantity: number): Promise<Products> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    this.logger.log(`Increasing stock for product ${uuid} by ${quantity}`);

    const product = await this.findByUuid(uuid);
    product.stock += quantity;

    const updated = await this.productsRepository.save(product);
    this.logger.log(`Stock increased for product ${updated.uuid}`);

    return updated;
  }

  /**
   * Get products with low stock
   * @param threshold Stock threshold (default: 10)
   * @returns Products with low stock
   */
  async getLowStockProducts(
    threshold = this.LOW_STOCK_THRESHOLD,
  ): Promise<Products[]> {
    this.logger.log(`Finding products with stock below ${threshold}`);

    return this.productsRepository.find({
      where: {
        stock: LessThan(threshold),
      },
      order: {
        stock: 'ASC',
      },
    });
  }

  /**
   * Check if product has sufficient stock by UUID
   * @param uuid Product UUID
   * @param quantity Required quantity
   * @returns boolean
   */
  async hasStock(uuid: string, quantity: number): Promise<boolean> {
    const product = await this.findByUuid(uuid);
    return product.stock >= quantity;
  }
}
