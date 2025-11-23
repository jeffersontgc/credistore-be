import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { ProductType } from '../entities/products.entity';

@InputType()
export class FilterProductInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => ProductType, { nullable: true })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @Min(1)
  limit?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  lowStock?: boolean;
}
