import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, Min, Max } from 'class-validator';

@InputType()
export class FindMonthlySalesInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(2000)
  year?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  @Max(12)
  month?: number;

  @Field(() => Int, { defaultValue: 1 })
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 12 })
  @Min(1)
  limit: number = 12;
}
