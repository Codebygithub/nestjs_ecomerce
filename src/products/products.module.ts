import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { CACHE_MODULE_OPTIONS, CacheInterceptor, CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { UserModule } from 'src/user/user.module';
import { OrderModule } from 'src/order/order.module';
import { RateLimitService } from 'src/utility/service/rate-limit.service';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { BullModule } from '@nestjs/bull';
import { InventoryModule } from 'src/inventory/inventory.module';
import { InventoryEntity } from 'src/inventory/entities/inventory.entity';


@Module({
  imports:[TypeOrmModule.forFeature([ProductEntity , CategoryEntity , InventoryEntity]),CategoriesModule , UserModule,InventoryModule,
  forwardRef(()=>OrderModule),
  BullModule.registerQueue({
    name:'product',
    redis:{ 
      host:'localhost',
      port:6379
    }
  })
  
],
  
  
  controllers: [ProductsController],
  providers: [ProductsService,
    CacheInterceptor,
    RateLimitService
  ],
  exports:[ProductsService]
})
export class ProductsModule {}