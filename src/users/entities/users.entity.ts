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

  @Column({ type: 'uuid', unique: true, name: 'uuid' })
  @Field(() => String)
  uuid: string;

  @Column({ type: 'varchar', length: 100, name: 'firstname' })
  @Field(() => String)
  firstname: string;

  @Column({ type: 'varchar', length: 10, name: 'lastname' })
  @Field(() => String)
  lastname: string;

  @Column({ type: 'varchar', unique: true, name: 'email' })
  @Field(() => String)
  email: string;

  @Column({ name: 'profilePicture', nullable: true })
  @Field(() => String, { nullable: true })
  picture?: string;

  @Column({ type: 'boolean', default: false, name: 'isDelinquent' })
  @Field(() => Boolean, {
    defaultValue: false,
    description: 'Indicates if the user is delinquent (moroso)',
  })
  isDelinquent: boolean;

  @Column({ type: 'boolean', default: false, name: 'isCeo' })
  @Field(() => Boolean, {
    defaultValue: false,
    description: 'ceo user',
  })
  isCeo: boolean;

  @Exclude()
  @Column({ type: 'varchar', length: 100, name: 'password' })
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
