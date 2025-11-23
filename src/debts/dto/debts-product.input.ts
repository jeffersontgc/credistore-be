import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsString, Min } from 'class-validator';

@InputType()
export class DebtProductInput {
  @Field(() => String)
  @IsString()
  product_uuid: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;
}
