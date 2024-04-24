// queue.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('email-blog') private readonly emailQueue: Queue) {}

  async sendEmailNotification(createBlogDto: CreateBlogDto, currentUser: UserEntity): Promise<void> {
    await this.emailQueue.add('sendEmailBlog', { createBlogDto, currentUser });
  }
}
