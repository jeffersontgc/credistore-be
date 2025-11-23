import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ProductType } from '../entities/products.entity';

@InputType()
export class CreateProductInput {
  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  stock: number;

  @Field(() => ProductType)
  @IsEnum(ProductType)
  type: ProductType;
}
