import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Debts } from '../entities/debts.entity';

@ObjectType()
export class PaginatedDebts {
  @Field(() => [Debts])
  data: Debts[];

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

  @Field(() => Float)
  totalAmount: number;
}
