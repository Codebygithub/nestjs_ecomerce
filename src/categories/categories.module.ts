
import { Module, forwardRef } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { EmailService } from 'src/email/email.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:
    [TypeOrmModule.forFeature([CategoryEntity,UserEntity]),
    forwardRef(()=>UserModule)
    
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService,UserService,EmailService],
  exports:[CategoriesService]
})
export class CategoriesModule {}