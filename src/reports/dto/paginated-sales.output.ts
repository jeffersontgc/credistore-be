import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ReportSalesDaily } from '../entities/report-sales-daily.entity';
import { ReportSalesMonthly } from '../entities/report-sales-monthly.entity';

@ObjectType()
export class PaginatedDailySales {
  @Field(() => [ReportSalesDaily])
  data: ReportSalesDaily[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}

@ObjectType()
export class PaginatedMonthlySales {
  @Field(() => [ReportSalesMonthly])
  data: ReportSalesMonthly[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}
