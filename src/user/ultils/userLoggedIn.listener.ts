import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { UserLoggedInEvent } from "./userLoggedIn.event";
import { EmailService } from "src/email/email.service";
import { UserService } from "../user.service";

@Injectable()
export class UserLoggedListener { 

    constructor(private readonly emailService:EmailService ,
        private readonly userService:UserService
    ){}

    @OnEvent('user.loggedin')
    async handleUserLoggedInEvent(event: UserLoggedInEvent) {
        console.log(`User with ID ${event.userId} logged in at ${event.loginTime}`);

        const {userId,loginTime} = event
        const user = await this.userService.findOne(userId)

        const subject = 'Login Notification';
        const text = `Hello ${user.name},\n\nYou have successfully logged in at ${loginTime}.`;

        
        try {
            await this.emailService.sendEmailNotification(user.email , subject,text)
            console.log("Successfully sent login notification to ",user.email);
            
        } catch (error) {
            console.error('Error sending lpgij notification email:',error)
        }
       
      }

}