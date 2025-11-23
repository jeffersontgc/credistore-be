import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Public } from '../../common/decorators/public.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CreateUserInput } from '../dto/create-user.input';
import { UsersService } from '../services/users.service';
import { User } from 'src/users/entities/users.entity';
import { SuccessReponse } from 'src/utils/response';

@Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Mutation(() => SuccessReponse)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<SuccessReponse> {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'getUser' })
  async getUser(
    @Args('uuid', { type: () => String }) uuid: string,
  ): Promise<User | null> {
    return this.usersService.asyncFindByUuid(uuid);
  }
}
