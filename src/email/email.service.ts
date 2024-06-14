// email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { from } from 'rxjs';
import { CreateBlogDto } from 'src/blog/dto/create-blog.dto';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service:'gmail',
      port:456,
      secure:true,
      logger:true,
      debug:true,
      auth:{
        user:process.env.EMAIL_USERNAME,
        pass:process.env.EMAIL_PASSWORD
      },
      tls:{
        rejectUnauthorized:true
      }
     

    });
  }

  async sendConfirmationEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Địa chỉ email gửi
      to: email, // Địa chỉ email nhận
      subject: 'Xác nhận tài khoản', // Tiêu đề email
      html: `<p>Mã OTP của bạn là: <strong>${otp}</strong></p>`, // Nội dung email
    };
    console.log(mailOptions)
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email confirmation sent to ${email}`);
    } catch (error) {
      console.error(`Error sending confirmation email to ${email}: ${error.message}`);
    }
  }
  async sendUpdateEmail(email: string): Promise<void> {
    const mailOptions = {
    from: process.env.EMAIL_FROM, // Địa chỉ email gửi,
    toString: email,
    subject: 'Email Update', // Tiêu đề email
    text: 'Your email has been updated.', // Nội dung email
    html: `<p>Your email has been updated.</p>`,
    }
    await this.transporter.sendMail(mailOptions);
}
  
  async sendEmailBlog(email: string,createBlogDto:CreateBlogDto): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Địa chỉ email gửi
      to: email, // Địa chỉ email nhận
      subject: 'New Blog Created', // Tiêu đề email
      html: `A new blog title ${createBlogDto.title} has been created `, // Nội dung email
    };
    console.log(mailOptions)
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email confirmation sent to ${email}`);
    } catch (error) {
      console.error(`Error sending confirmation email to ${email}: ${error.message}`);
    }
  }
  async sendEmailNotification(email:string , subject:string,text:string) {
    let options={
      from :process.env.EMAIL_FROM,
      to:email ,
      subject,
      text
    }
    try {
      await this.transporter.sendMail(options)
      console.log(`Email Notification sent to ${email}`);

    } catch (error) {
      console.error('Error sending notification email to' +email)
    }
  }

  async sendNotificationComment(email:string , subject:string,text:string){
    let options={
      from :process.env.EMAIL_FROM,
      to:email ,
      subject,
      text
    }
    try {
      await this.transporter.sendMail(options)
      console.log(`Email Notification sent to ${email}`);

    } catch (error) {
      console.error('Error sending notification email to' +email)
  

  }
}
   
  
  
}