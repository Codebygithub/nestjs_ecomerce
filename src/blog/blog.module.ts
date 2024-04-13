import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports:[TypeOrmModule.forFeature([BlogEntity]) , CategoriesModule],
  controllers: [BlogController],
  providers: [BlogService],
  exports:[BlogService]
})
export class BlogModule {}
