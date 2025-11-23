import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { ReportSalesDaily } from '../entities/report-sales-daily.entity';
import { ReportSalesMonthly } from '../entities/report-sales-monthly.entity';
import { Debts, DebtsStatus } from '../../debts/entities/debts.entity';
import { FindDailySalesInput } from '../dto/find-daily-sales.input';
import { FindMonthlySalesInput } from '../dto/find-monthly-sales.input';
import {
  PaginatedDailySales,
  PaginatedMonthlySales,
} from '../dto/paginated-sales.output';

interface DebtEventPayload {
  debt: Debts;
  previousStatus?: DebtsStatus;
}

@Injectable()
export class ReportSalesService {
  private readonly logger = new Logger(ReportSalesService.name);

  constructor(
    @InjectRepository(ReportSalesDaily)
    private readonly reportDailyRepo: Repository<ReportSalesDaily>,
    @InjectRepository(ReportSalesMonthly)
    private readonly reportMonthlyRepo: Repository<ReportSalesMonthly>,
    @InjectRepository(Debts)
    private readonly debtsRepo: Repository<Debts>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Handle debt created event
   */
  @OnEvent('reports-sales.debt-created')
  async handleDebtCreated(payload: DebtEventPayload) {
    const { debt } = payload;
    this.logger.log(`Handling debt created event for debt: ${debt.uuid}`);

    try {
      const createdDate = new Date(debt.createdAt);
      const saleDate = new Date(
        createdDate.getFullYear(),
        createdDate.getMonth(),
        createdDate.getDate(),
      );

      // Update daily report
      await this.updateDailyReport(saleDate);

      // Update monthly report
      await this.updateMonthlyReport(
        createdDate.getFullYear(),
        createdDate.getMonth() + 1,
      );

      this.logger.log(
        `Successfully updated reports for debt created: ${debt.uuid}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling debt created event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle debt status updated event
   */
  @OnEvent('reports-sales.debt-status-updated')
  async handleDebtStatusUpdated(payload: DebtEventPayload) {
    const { debt, previousStatus } = payload;
    this.logger.log(
      `Handling debt status updated event for debt: ${debt.uuid}, from ${previousStatus} to ${debt.status}`,
    );

    try {
      const createdDate = new Date(debt.createdAt);
      const saleDate = new Date(
        createdDate.getFullYear(),
        createdDate.getMonth(),
        createdDate.getDate(),
      );

      // Update daily report
      await this.updateDailyReport(saleDate);

      // Update monthly report
      await this.updateMonthlyReport(
        createdDate.getFullYear(),
        createdDate.getMonth() + 1,
      );

      this.logger.log(
        `Successfully updated reports for debt status change: ${debt.uuid}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling debt status updated event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle debt cancelled event
   */
  @OnEvent('reports-sales.debt-cancelled')
  async handleDebtCancelled(payload: { debt: Debts }) {
    const { debt } = payload;
    this.logger.log(`Handling debt cancelled event for debt: ${debt.uuid}`);

    try {
      const createdDate = new Date(debt.createdAt);
      const saleDate = new Date(
        createdDate.getFullYear(),
        createdDate.getMonth(),
        createdDate.getDate(),
      );

      // Update daily report
      await this.updateDailyReport(saleDate);

      // Update monthly report
      await this.updateMonthlyReport(
        createdDate.getFullYear(),
        createdDate.getMonth() + 1,
      );

      this.logger.log(
        `Successfully updated reports for debt cancelled: ${debt.uuid}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling debt cancelled event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Update daily report for a specific date
   */
  private async updateDailyReport(saleDate: Date): Promise<void> {
    const startOfDay = new Date(saleDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(saleDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all debts for this day
    const debts = await this.debtsRepo.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
      relations: ['products'],
    });

    // Calculate metrics
    const totalSales = debts.reduce(
      (sum, debt) => sum + Number(debt.amount),
      0,
    );
    const totalTransactions = debts.length;
    const totalProductsSold = debts.reduce(
      (sum, debt) => sum + debt.products.length,
      0,
    );
    const averageSaleAmount =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Count by status
    const debtsCount = debts.filter(
      (d) => d.status === DebtsStatus.ACTIVE,
    ).length;
    const pendingDebtsCount = debts.filter(
      (d) => d.status === DebtsStatus.PENDING,
    ).length;
    const paidDebtsCount = debts.filter(
      (d) => d.status === DebtsStatus.PAID,
    ).length;
    const settledDebtsCount = debts.filter(
      (d) => d.status === DebtsStatus.SETTLED,
    ).length;

    // Calculate amounts by status
    const totalActiveAmount = debts
      .filter((d) => d.status === DebtsStatus.ACTIVE)
      .reduce((sum, debt) => sum + Number(debt.amount), 0);
    const totalPaidAmount = debts
      .filter(
        (d) =>
          d.status === DebtsStatus.PAID || d.status === DebtsStatus.SETTLED,
      )
      .reduce((sum, debt) => sum + Number(debt.amount), 0);

    // Find or create daily report
    let report = await this.reportDailyRepo.findOne({
      where: { saleDate },
    });

    if (!report) {
      report = this.reportDailyRepo.create({ saleDate });
    }

    // Update values
    report.totalSales = totalSales;
    report.totalTransactions = totalTransactions;
    report.totalProductsSold = totalProductsSold;
    report.averageSaleAmount = averageSaleAmount;
    report.paidDebtsCount = debtsCount;
    report.pendingDebtsCount = pendingDebtsCount;
    report.paidDebtsCount = paidDebtsCount;
    report.settledDebtsCount = settledDebtsCount;
    report.totalActiveAmount = totalActiveAmount;
    report.totalPaidAmount = totalPaidAmount;

    await this.reportDailyRepo.save(report);

    this.logger.log(
      `Daily report updated for date: ${saleDate.toISOString().split('T')[0]}`,
    );
  }

  /**
   * Update monthly report for a specific year and month
   */
  private async updateMonthlyReport(
    year: number,
    month: number,
  ): Promise<void> {
    // Get start and end of month
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all debts for this month
    const debts = await this.debtsRepo.find({
      where: {
        createdAt: Between(startOfMonth, endOfMonth),
      },
      relations: ['products'],
    });

    // Calculate metrics
    const totalSales = debts.reduce(
      (sum, debt) => sum + Number(debt.amount),
      0,
    );
    const totalTransactions = debts.length;
    const totalProductsSold = debts.reduce(
      (sum, debt) => sum + debt.products.length,
      0,
    );
    const averageSaleAmount =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Count by status
    const debtsCount = debts.filter(
      (d) => d.status === DebtsStatus.ACTIVE,
    ).length;
    const pendingDebtsCount = debts.filter(
      (d) => d.status === DebtsStatus.PENDING,
    ).length;
    const paidDebtsCount = debts.filter(
      (d) => d.status === DebtsStatus.PAID,
    ).length;
    const settledDebtsCount = debts.filter(
      (d) => d.status === DebtsStatus.SETTLED,
    ).length;

    // Calculate amounts by status
    const totalActiveAmount = debts
      .filter((d) => d.status === DebtsStatus.ACTIVE)
      .reduce((sum, debt) => sum + Number(debt.amount), 0);
    const totalPaidAmount = debts
      .filter(
        (d) =>
          d.status === DebtsStatus.PAID || d.status === DebtsStatus.SETTLED,
      )
      .reduce((sum, debt) => sum + Number(debt.amount), 0);

    // Calculate total days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    const averageDailySales = daysInMonth > 0 ? totalSales / daysInMonth : 0;

    // Find or create monthly report
    let report = await this.reportMonthlyRepo.findOne({
      where: { year, month },
    });

    if (!report) {
      report = this.reportMonthlyRepo.create({ year, month });
    }

    // Update values
    report.totalSales = totalSales;
    report.totalTransactions = totalTransactions;
    report.totalProductsSold = totalProductsSold;
    report.averageSaleAmount = averageSaleAmount;
    report.paidDebtsCount = debtsCount;
    report.pendingDebtsCount = pendingDebtsCount;
    report.paidDebtsCount = paidDebtsCount;
    report.settledDebtsCount = settledDebtsCount;
    report.totalActiveAmount = totalActiveAmount;
    report.totalPaidAmount = totalPaidAmount;
    report.totalDays = daysInMonth;
    report.averageDailySales = averageDailySales;

    await this.reportMonthlyRepo.save(report);

    this.logger.log(`Monthly report updated for: ${year}-${month}`);
  }

  /**
   * Find daily sales reports with filters
   */
  async findDailySales(
    filters: FindDailySalesInput,
  ): Promise<PaginatedDailySales> {
    const { startDate, endDate, page, limit } = filters;

    this.logger.log(
      `Finding daily sales with filters: ${JSON.stringify(filters)}`,
    );

    const queryBuilder = this.reportDailyRepo
      .createQueryBuilder('report')
      .orderBy('report.saleDate', 'DESC');

    // Apply date filters
    if (startDate && endDate) {
      queryBuilder.andWhere('report.saleDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('report.saleDate >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('report.saleDate <= :endDate', { endDate });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

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
   * Find monthly sales reports with filters
   */
  async findMonthlySales(
    filters: FindMonthlySalesInput,
  ): Promise<PaginatedMonthlySales> {
    const { year, month, page, limit } = filters;

    this.logger.log(
      `Finding monthly sales with filters: ${JSON.stringify(filters)}`,
    );

    const queryBuilder = this.reportMonthlyRepo
      .createQueryBuilder('report')
      .orderBy('report.year', 'DESC')
      .addOrderBy('report.month', 'DESC');

    // Apply filters
    if (year) {
      queryBuilder.andWhere('report.year = :year', { year });
    }

    if (month) {
      queryBuilder.andWhere('report.month = :month', { month });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

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
   * Get daily report by date
   */
  async getDailyReportByDate(date: Date): Promise<ReportSalesDaily | null> {
    const saleDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    return this.reportDailyRepo.findOne({
      where: { saleDate },
    });
  }

  /**
   * Get monthly report by year and month
   */
  async getMonthlyReportByYearMonth(
    year: number,
    month: number,
  ): Promise<ReportSalesMonthly | null> {
    return this.reportMonthlyRepo.findOne({
      where: { year, month },
    });
  }
}
