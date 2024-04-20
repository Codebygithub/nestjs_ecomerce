import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[TypeOrmModule.forFeature([BlogEntity]) , CategoriesModule, UserModule],
  controllers: [BlogController],
  providers: [BlogService],
  exports:[BlogService]
})
export class BlogModule {}
