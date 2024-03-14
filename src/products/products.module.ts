import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { redisStore } from 'cache-manager-redis-store';
import { CACHE_MODULE_OPTIONS, CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { UserModule } from 'src/user/user.module';
import { OrderModule } from 'src/order/order.module';


@Module({
  imports:[TypeOrmModule.forFeature([ProductEntity]),CategoriesModule , UserModule,
  forwardRef(()=>OrderModule),
  CacheModule.register<CacheModuleOptions>({
    isGlobal:true,
    store: typeof(redisStore),
    host: 'localhost',
    port: 6379,
  })
],
  
  
  controllers: [ProductsController],
  providers: [ProductsService],
  exports:[ProductsService]
})
export class ProductsModule {}
