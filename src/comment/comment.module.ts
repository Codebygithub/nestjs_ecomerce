import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from 'src/products/products.module';
import { UserModule } from 'src/user/user.module';
import { ProductEntity } from 'src/products/entities/product.entity';
import { DataSource } from 'typeorm';
import { CommentService } from './comment.service';
import { CommentEntity } from './entities/comment.entity';

@Module({
  imports:[TypeOrmModule.forFeature([CommentEntity , ProductEntity]) , ProductsModule , UserModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
