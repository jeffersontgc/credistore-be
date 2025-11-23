import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsDateString, Min } from 'class-validator';

@InputType()
export class FindDailySalesInput {
  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @Field(() => Int, { defaultValue: 1 })
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 30 })
  @Min(1)
  limit: number = 30;
}
