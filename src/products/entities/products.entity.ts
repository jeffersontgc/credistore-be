import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { DebtItem } from 'src/debts/entities/debts-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductType {
  GRANOS_BASICOS = 'granos_basicos',
  SNACKS = 'snacks',
  BEBIDAS = 'bebidas',
  LACTEOS = 'lacteos',
}

registerEnumType(ProductType, {
  name: 'ProductType',
});

@Entity({ name: 'products' })
@ObjectType()
export class Products {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: 'uuid', unique: true, name: 'uuid' })
  @Field(() => String)
  uuid: string;

  @Column({ type: 'varchar', length: 100, name: 'name' })
  @Field(() => String)
  name: string;

  @Column({ type: 'numeric', name: 'price' })
  @Field(() => Number)
  price: number;

  @Column({ name: 'stock' })
  @Field(() => Int)
  stock: number;

  @Column({
    type: 'enum',
    enum: ProductType,
    name: 'type',
  })
  @Field(() => ProductType)
  type: ProductType;

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => DebtItem, (item) => item.product)
  items: DebtItem[];
}
