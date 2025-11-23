import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Debts } from 'src/debts/entities/debts.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Field(() => String)
  uuid: string;

  @Column({ type: 'varchar', length: 100 })
  @Field(() => String)
  firstname: string;

  @Column({ type: 'varchar', length: 100 })
  @Field(() => String)
  lastname: string;

  @Column({ type: 'varchar', unique: true })
  @Field(() => String)
  email: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  picture?: string;

  @Column({ type: 'boolean', default: false })
  @Field(() => Boolean, {
    defaultValue: false,
    description: 'Indicates if the user is delinquent (moroso)',
  })
  isDelinquent: boolean;

  @Exclude()
  @Column({ type: 'varchar', length: 100 })
  password: string;

  @OneToMany(() => Debts, (d) => d.user)
  @Field(() => [Debts], { nullable: true })
  debts: Debts[];

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

  @Field(() => Date, { nullable: true })
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt?: Date;
}
