import { Module } from '@nestjs/common';
import { CommentBlogService } from './comment-blog.service';
import { CommentBlogController } from './comment-blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment-blog.entity';
import { BlogModule } from 'src/blog/blog.module';
import { UserModule } from 'src/user/user.module';
import { BlogEntity } from 'src/blog/entities/blog.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service'; 
import { BlogService } from 'src/blog/blog.service'; 
import { EmailService } from 'src/email/email.service';
import { CategoriesService } from 'src/categories/categories.service';
import { CategoriesModule } from 'src/categories/categories.module';
import { QueueService } from 'src/blog/email-blog.service';
import { EditHistoryEntity } from './entities/editHistoryComment-blog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity, BlogEntity, UserEntity,EditHistoryEntity]),
    BlogModule,
    UserModule ,
    CategoriesModule
    
  ],
  controllers: [CommentBlogController],
  providers: [CommentBlogService], 
})
export class CommentBlogModule {}
