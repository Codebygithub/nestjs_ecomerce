import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountEntity } from './entities/discount.entity';
import { ProductsModule } from 'src/products/products.module';
import { UserModule } from 'src/user/user.module';
import { ProductEntity } from 'src/products/entities/product.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([DiscountEntity,ProductEntity , UserEntity]),ProductsModule , UserModule],
  controllers: [DiscountsController],
  providers: [DiscountsService],
})
export class DiscountsModule {}