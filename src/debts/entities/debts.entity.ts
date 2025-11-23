import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DebtItem } from './debts-item.entity';
import { User } from 'src/users/entities/users.entity';

export enum DebtsStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  PAID = 'paid',
  SETTLED = 'settled',
}

registerEnumType(DebtsStatus, {
  name: 'DebtsStatus',
});

@Entity({ name: 'debts' })
@ObjectType()
export class Debts {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Field(() => String)
  uuid: string;

  @ManyToOne(() => User, (u) => u.debts, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User;

  @Column({ type: 'timestamptz' })
  @Field(() => Date)
  date_pay: Date;

  @Column({
    type: 'enum',
    enum: DebtsStatus,
    default: DebtsStatus.ACTIVE,
  })
  @Field(() => DebtsStatus)
  status: DebtsStatus;

  @Column({ type: 'numeric' })
  @Field(() => Number)
  amount: number;

  @OneToMany(() => DebtItem, (item) => item.debt, { cascade: true })
  @Field(() => [DebtItem])
  products: DebtItem[];

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
