import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { Debts, DebtsStatus } from '../entities/debts.entity';
import { DebtsService } from '../services/debts.service';
import { CreateDebtInput } from 'src/debts/dto/create-debts.input';
import { PaginatedDebts } from 'src/debts/dto/paginated-debts.output';

@Resolver(() => Debts)
@UseGuards(GqlAuthGuard)
export class DebtsResolver {
  constructor(private readonly debtsService: DebtsService) {}

  @Mutation(() => Debts)
  async createDebt(
    @Args('createDebtInput') createDebtInput: CreateDebtInput,
  ): Promise<Debts> {
    return this.debtsService.create(createDebtInput);
  }

  @Query(() => PaginatedDebts, { name: 'debts' })
  async findAll(): Promise<PaginatedDebts> {
    return this.debtsService.findAll();
  }

  @Query(() => Debts, { name: 'debt' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Debts> {
    return this.debtsService.findOne(id);
  }

  @Query(() => [Debts], { name: 'debtsByUser' })
  async findByUser(
    @Args('user_uuid', { type: () => String }) user_uuid: string,
  ): Promise<Debts[]> {
    return this.debtsService.findByUser(user_uuid);
  }

  @Mutation(() => Debts)
  async updateDebtStatus(
    @Args('uuid', { type: () => String }) uuid: string,
    @Args('status', { type: () => DebtsStatus }) status: DebtsStatus,
  ): Promise<Debts> {
    return this.debtsService.updateStatus(uuid, status);
  }
}
