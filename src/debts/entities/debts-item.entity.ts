import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Debts } from './debts.entity';
import { Products } from 'src/products/entities/products.entity';

@Entity({ name: 'debts_items' })
@ObjectType()
export class DebtItem {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Field(() => String)
  uuid: string;

  @ManyToOne(() => Debts, (d) => d.products, { onDelete: 'CASCADE' })
  @Field(() => Debts)
  debt: Debts;

  @ManyToOne(() => Products, { onDelete: 'CASCADE' })
  @Field(() => Products)
  product: Products;

  @Column()
  @Field(() => Int)
  quantity: number;

  @Column({ type: 'numeric' })
  @Field(() => Number)
  price: number;

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
