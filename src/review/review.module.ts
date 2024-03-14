import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { ProductsModule } from 'src/products/products.module';
import { redisStore } from 'cache-manager-redis-store';
import { CACHE_MODULE_OPTIONS, CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { UserModule } from 'src/user/user.module';



@Module({
  imports:[TypeOrmModule.forFeature([ReviewEntity]),ProductsModule,UserModule,
  CacheModule.register<CacheModuleOptions>({
    isGlobal:true,
    store: typeof(redisStore),
    host: 'localhost',
    port: 6379,
  })],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
