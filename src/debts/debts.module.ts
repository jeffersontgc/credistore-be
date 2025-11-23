import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { DebtItem } from './entities/debts-item.entity';
import { Debts } from './entities/debts.entity';

import { DebtsResolver } from 'src/debts/resolvers/debts.resolver';
import { DebtsService } from 'src/debts/services/debts.service';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Debts, DebtItem]),
    ProductsModule,
    UsersModule,
  ],
  providers: [DebtsResolver, DebtsService],
  exports: [DebtsService],
})
export class DebtsModule {}
