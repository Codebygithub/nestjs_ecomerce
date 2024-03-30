import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { ProductsModule } from 'src/products/products.module';
import { CACHE_MODULE_OPTIONS, CacheInterceptor, CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { UserModule } from 'src/user/user.module';



@Module({
  imports:[TypeOrmModule.forFeature([ReviewEntity]),ProductsModule,UserModule,],
  controllers: [ReviewController],
  providers: [ReviewService,
    CacheInterceptor
  
  ],
})
export class ReviewModule {}
