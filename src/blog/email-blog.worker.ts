import {  Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { EmailService } from "src/email/email.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UserEntity } from "src/user/entities/user.entity";

@Processor('email-blog')
export class emailBlogWorker {
    constructor(private readonly emailService:EmailService){}
    @Process('sendEmailBlog') 
    async sendEmailBlog(job:Job<{creaBlogDto:CreateBlogDto , currentUser:UserEntity}>) {
        const {creaBlogDto , currentUser} = job.data
        await this.emailService.sendEmailBlog(currentUser.email,creaBlogDto)
    }

}