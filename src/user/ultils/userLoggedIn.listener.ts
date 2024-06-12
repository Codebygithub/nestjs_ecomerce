import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { UserLoggedInEvent } from "./userLoggedIn.event";
import { EmailService } from "src/email/email.service";
import { UserService } from "../user.service";

@Injectable()
export class UserLoggedListener { 

    constructor(private readonly emailService:EmailService ,
        private readonly userService:UserService
    ){}
    private readonly logger = new Logger(UserLoggedInEvent.name)
    @OnEvent('user.loggedin')
    async handleUserLoggedInEvent(event: UserLoggedInEvent) {
        this.logger.log(`User with ID ${event.userId} logged in at ${event.loginTime}`);

        const {userId,loginTime} = event
        const user = await this.userService.findOne(userId)

        const subject = 'Login Notification';
        const text = `Hello ${user.name},\n\nYou have successfully logged in at ${loginTime}.`;

        
        try {
            await this.emailService.sendEmailNotification(user.email , subject,text)
            this.logger.log("Successfully sent login notification to ",user.email);
            
        } catch (error) {
            this.logger.error('Error sending login notification email:',error)
        }
       
      }

}