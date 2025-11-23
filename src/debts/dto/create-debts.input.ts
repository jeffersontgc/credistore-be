import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DebtProductInput } from './debts-product.input';

@InputType()
export class CreateDebtInput {
  @Field(() => String)
  @IsString()
  user_uuid: string;

  @Field(() => Date)
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @Field(() => [DebtProductInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DebtProductInput)
  products: DebtProductInput[];
}
