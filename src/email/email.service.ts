// email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // Thay đổi cấu hình dưới đây tùy theo nhà cung cấp email của bạn
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
}
