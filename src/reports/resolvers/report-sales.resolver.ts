import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { ReportSalesDaily } from '../entities/report-sales-daily.entity';
import { ReportSalesMonthly } from '../entities/report-sales-monthly.entity';
import { ReportSalesService } from '../services/report-sales.service';
import { FindDailySalesInput } from '../dto/find-daily-sales.input';
import { FindMonthlySalesInput } from '../dto/find-monthly-sales.input';
import {
  PaginatedDailySales,
  PaginatedMonthlySales,
} from '../dto/paginated-sales.output';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ReportSalesResolver {
  constructor(private readonly reportSalesService: ReportSalesService) {}

  @Query(() => PaginatedDailySales, { name: 'dailySalesReports' })
  async findDailySales(
    @Args('filters', { type: () => FindDailySalesInput, nullable: true })
    filters?: FindDailySalesInput,
  ): Promise<PaginatedDailySales> {
    const defaultFilters: FindDailySalesInput = {
      page: 1,
      limit: 30,
      ...filters,
    };
    return this.reportSalesService.findDailySales(defaultFilters);
  }

  @Query(() => PaginatedMonthlySales, { name: 'monthlySalesReports' })
  async findMonthlySales(
    @Args('filters', { type: () => FindMonthlySalesInput, nullable: true })
    filters?: FindMonthlySalesInput,
  ): Promise<PaginatedMonthlySales> {
    const defaultFilters: FindMonthlySalesInput = {
      page: 1,
      limit: 12,
      ...filters,
    };
    return this.reportSalesService.findMonthlySales(defaultFilters);
  }

  @Query(() => ReportSalesDaily, {
    name: 'dailySalesReportByDate',
    nullable: true,
  })
  async getDailyReportByDate(
    @Args('date', { type: () => Date }) date: Date,
  ): Promise<ReportSalesDaily | null> {
    return this.reportSalesService.getDailyReportByDate(date);
  }

  @Query(() => ReportSalesMonthly, {
    name: 'monthlySalesReportByYearMonth',
    nullable: true,
  })
  async getMonthlyReportByYearMonth(
    @Args('year', { type: () => Int }) year: number,
    @Args('month', { type: () => Int }) month: number,
  ): Promise<ReportSalesMonthly | null> {
    return this.reportSalesService.getMonthlyReportByYearMonth(year, month);
  }
}
