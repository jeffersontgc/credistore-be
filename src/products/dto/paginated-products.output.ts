import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Products } from '../entities/products.entity';

@ObjectType()
export class PaginatedProducts {
  @Field(() => [Products])
  data: Products[];

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
