import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Int } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { CreateProductInput } from '../dto/create-producto.input';
import { UpdateProductInput } from '../dto/update-producto.input';
import { FilterProductInput } from '../dto/filter-producto.input';
import { PaginatedProducts } from '../dto/paginated-products.output';
import { Products } from '../entities/products.entity';
import { ProductsService } from '../services/productos.service';
import { SuccessReponse } from 'src/utils/response';

@Resolver(() => Products)
@UseGuards(GqlAuthGuard)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Mutation(() => SuccessReponse)
  async createProduct(
    @Args('args') args: CreateProductInput,
  ): Promise<Products> {
    return this.productsService.create(args);
  }

  @Query(() => PaginatedProducts, { name: 'products' })
  async findAll(
    @Args('filters', { nullable: true }) filters?: FilterProductInput,
  ): Promise<PaginatedProducts> {
    return this.productsService.findAll(filters);
  }

  @Query(() => Products, { name: 'getProduct' })
  async getProduct(
    @Args('product_uuid', { type: () => String }) uuid: string,
  ): Promise<Products> {
    return this.productsService.findByUuid(uuid);
  }

  @Mutation(() => Products)
  async updateProduct(
    @Args('args') args: UpdateProductInput,
  ): Promise<Products> {
    return this.productsService.update(args);
  }

  @Mutation(() => Boolean)
  async removeProduct(
    @Args('uuid', { type: () => String }) uuid: string,
  ): Promise<boolean> {
    await this.productsService.remove(uuid);
    return true;
  }

  @Query(() => [Products], { name: 'lowStockProducts' })
  async getLowStockProducts(
    @Args('threshold', { type: () => Int, nullable: true }) threshold?: number,
  ): Promise<Products[]> {
    return this.productsService.getLowStockProducts(threshold);
  }

  @Mutation(() => Products)
  async increaseStock(
    @Args('uuid', { type: () => String }) uuid: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ): Promise<Products> {
    return this.productsService.increaseStock(uuid, quantity);
  }
}
