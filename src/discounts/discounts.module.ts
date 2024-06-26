import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountEntity } from './entities/discount.entity';
import { ProductsModule } from 'src/products/products.module';
import { UserModule } from 'src/user/user.module';
import { ProductEntity } from 'src/products/entities/product.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { DiscountUserEntity } from './entities/discount-user.entity';
import { SavedDiscountEntity } from './entities/save-discount.entity';
import { BullModule } from '@nestjs/bull';
import { discountWorker } from './discount.worker';

@Module({
  imports:[TypeOrmModule.forFeature([DiscountEntity,ProductEntity , UserEntity,DiscountUserEntity,SavedDiscountEntity]),ProductsModule , UserModule,
  BullModule.registerQueueAsync({
    name:'discount'
  })  ,
]
  
  ,
  controllers: [DiscountsController],
  providers: [DiscountsService,discountWorker],
  exports:[DiscountsService]
})
export class DiscountsModule {}
