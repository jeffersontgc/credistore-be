import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { ProductsService } from './services/productos.service';
import { ProductsResolver } from './resolvers/productos.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Products])],
  providers: [ProductsResolver, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
