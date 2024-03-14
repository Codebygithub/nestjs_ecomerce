import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { EmailService } from 'src/email/email.service';

@Module({
  imports:
    [TypeOrmModule.forFeature([CategoryEntity,UserEntity]),
    CacheModule.register<CacheModuleOptions>({
      isGlobal:true,
      store: typeof(redisStore),
      host: 'localhost',
      port: 6379,
    }),
    
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService,UserService,EmailService],
  exports:[CategoriesService]
})
export class CategoriesModule {}
