import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EmailService } from "src/email/email.service";
import { UserService } from "src/user/user.service";
import { commentEvent } from "./comment.event";

@Injectable()
export class commentListener {
  constructor(private readonly emailService:EmailService,
              private readonly userService:UserService

  ){}

  @OnEvent('user.comment')
  async handleUserComment(event:commentEvent) {
    console.log(`User with ID ${event.userId} comment at ${event.commentTime}`)
    const {userId , commentTime} = event
    const user = await this.userService.findOne(userId)
    const subject = 'COMMENT NOTIFICATION'
    const text = `Hello ${user.name},\n\nYou have successfully logged in at ${commentTime}.`;

    try {
        await this.emailService.sendNotificationComment(user.email,subject,text)
    } catch (error) {
        console.log(`Error sending comment notification email`, error)
    }

    
    }


}