import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@Entity('reports_sales_monthly')
@ObjectType()
@Index(['year', 'month'], { unique: true })
export class ReportSalesMonthly {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'year', type: 'int' })
  @Field(() => Int, { name: 'year' })
  year: number;

  @Column({ name: 'month', type: 'int' })
  @Field(() => Int, { name: 'month' })
  month: number;

  @Column({ name: 'total_sales', type: 'numeric', default: 0 })
  @Field(() => Float, { name: 'total_sales' })
  totalSales: number;

  @Column({ name: 'total_transactions', type: 'int', default: 0 })
  @Field(() => Int, { name: 'total_transactions' })
  totalTransactions: number;

  @Column({ name: 'total_products_sold', type: 'int', default: 0 })
  @Field(() => Int, { name: 'total_products_sold' })
  totalProductsSold: number;

  @Column({ name: 'average_sale_amount', type: 'numeric', default: 0 })
  @Field(() => Float, { name: 'average_sale_amount' })
  averageSaleAmount: number;

  @Column({ name: 'active_debts_count', type: 'int', default: 0 })
  @Field(() => Int, { name: 'active_debts_count' })
  activeDebtsCount: number;

  @Column({ name: 'pending_debts_count', type: 'int', default: 0 })
  @Field(() => Int, { name: 'pending_debts_count' })
  pendingDebtsCount: number;

  @Column({ name: 'paid_debts_count', type: 'int', default: 0 })
  @Field(() => Int, { name: 'paid_debts_count' })
  paidDebtsCount: number;

  @Column({ name: 'settled_debts_count', type: 'int', default: 0 })
  @Field(() => Int, { name: 'settled_debts_count' })
  settledDebtsCount: number;

  @Column({ name: 'total_active_amount', type: 'numeric', default: 0 })
  @Field(() => Float, { name: 'total_active_amount' })
  totalActiveAmount: number;

  @Column({ name: 'total_paid_amount', type: 'numeric', default: 0 })
  @Field(() => Float, { name: 'total_paid_amount' })
  totalPaidAmount: number;

  @Column({ name: 'total_days', type: 'int', default: 0 })
  @Field(() => Int, { name: 'total_days' })
  totalDays: number;

  @Column({ name: 'average_daily_sales', type: 'numeric', default: 0 })
  @Field(() => Float, { name: 'average_daily_sales' })
  averageDailySales: number;

  @Field(() => Date)
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
  })
  deletedAt?: Date;
}
