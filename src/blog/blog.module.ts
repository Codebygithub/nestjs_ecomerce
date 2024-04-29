import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { UserModule } from 'src/user/user.module';
import { topicBlogEntity } from './entities/topic-blog.entity';
import { EmailService } from 'src/email/email.service';
import { emailBlogWorker } from './email-blog.worker';
import { QueueService } from './email-blog.service';
import { BullModule } from '@nestjs/bull';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { UserService } from 'src/user/user.service';

@Module({
  imports:[TypeOrmModule.forFeature([BlogEntity,topicBlogEntity]) , CategoriesModule, UserModule,
  BullModule.registerQueueAsync({
    name:'email-blog'
  }),
],
  controllers: [BlogController],
  providers: [BlogService,EmailService,emailBlogWorker,QueueService,CacheInterceptor],
  exports:[BlogService]
})
export class BlogModule {}
