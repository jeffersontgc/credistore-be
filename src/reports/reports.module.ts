import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportSalesDaily } from './entities/report-sales-daily.entity';
import { ReportSalesMonthly } from './entities/report-sales-monthly.entity';
import { Debts } from '../debts/entities/debts.entity';
import { ReportSalesService } from './services/report-sales.service';
import { ReportSalesResolver } from './resolvers/report-sales.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportSalesDaily, ReportSalesMonthly, Debts]),
  ],
  providers: [ReportSalesService, ReportSalesResolver],
  exports: [ReportSalesService],
})
export class ReportsModule {}
