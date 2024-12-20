import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { UserService } from 'src/user/user.service';
import { ProductsModule } from 'src/products/products.module';
import { UserModule } from 'src/user/user.module';
import { CategoriesService } from 'src/categories/categories.service';
import { OrderService } from 'src/order/order.service';
import { EmailService } from 'src/email/email.service';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { OrderEntity } from 'src/order/entities/order.entity';
import { OrderProductsEntity } from 'src/order/entities/order-products.entity';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheInterceptor, CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { CartWorker } from './cart.worker';
import  *  as redisStore from "cache-manager-redis-store";
import { config } from 'dotenv';
import { Redis } from 'ioredis';
import { InventoryModule } from 'src/inventory/inventory.module';


@Module({
  imports:[TypeOrmModule.forFeature([CartEntity , ProductEntity , UserEntity,CategoryEntity,OrderEntity,OrderProductsEntity]), InventoryModule,
    BullModule.registerQueueAsync({
      name:'cart'
    })
  ],
  controllers: [CartController],
  providers: [CartService,ProductsService , UserService,CategoriesService,OrderService,EmailService,
    CacheInterceptor,CartWorker
  
  ],
  
})
export class CartModule {}