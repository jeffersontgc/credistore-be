import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { DebtsStatus } from '../entities/debts.entity';

@InputType()
export class FilterDebtInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  user_uuid?: string;

  @Field(() => DebtsStatus, { nullable: true })
  @IsOptional()
  @IsEnum(DebtsStatus)
  status?: DebtsStatus;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @Min(1)
  limit?: number;
}
