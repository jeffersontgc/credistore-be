import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsNotEmpty()
  firstname: string;

  @Field(() => String)
  @IsNotEmpty()
  lastname: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @MinLength(6)
  password: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  profilePicture?: string;
}
