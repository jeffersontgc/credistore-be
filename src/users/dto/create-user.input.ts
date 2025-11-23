import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { User } from 'src/users/entities/users.entity';

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

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
  data: User[];

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
