import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Like, Repository, UpdateResult } from 'typeorm';
import { signupDto } from './dto/user-signup.dto';
import {hash} from'bcrypt'
import{compare} from 'bcrypt'
import { signinDto } from './dto/user-signin.dto';
import { match, throws } from 'assert';
import { sign } from 'jsonwebtoken';
import { Response } from 'express';
import { FilterUserDto } from './dto/filter-user.dto';
import * as bcrypt from 'bcrypt';
import { createUserDto } from './dto/create-user.dto';
import { UserDetail } from './ultils/userDetail.type';
import * as jwt from 'jsonwebtoken';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as nodemailer from 'nodemailer';
import { EmailService } from 'src/email/email.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserLoggedInEvent } from './ultils/userLoggedIn.event';



@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private userRepository:Repository<UserEntity>,
              private readonly emailService:EmailService,
              private readonly eventEmiiter:EventEmitter2
              
  
  ){}
  async validate(details:UserDetail){
    const user = await this.userRepository.findOneBy({email:details.email})
    if(user ) return user
    if(!user) throw new NotFoundException('USER NOT FOUND')
    const newUser = this.userRepository.create(details)
    return await this.userRepository.save(newUser)
  }
  async findUser(id:number){
    const user = await this.userRepository.findOneBy({id})
    return user ; 
  }
  async createUserByAdmin(createUserDto:createUserDto):Promise<UserEntity>{
    const hashPassword = await bcrypt.hash(createUserDto.password,10)
    const res = await this.userRepository.save({...createUserDto , password : hashPassword})
    return res
  }
  async logOut(res:Response):Promise<void>{
    res.clearCookie('refreshToken')
  }
  async signup(signupDto:signupDto):Promise<UserEntity>{
    const userExist = await this.findUserEmail(signupDto.email)
    if(userExist) throw new BadRequestException('EMAIL VALID')
    signupDto.password = await hash(signupDto.password,10)
    const otp = this.generateOTP()
    const hashedOtp = await hash(otp,10)
    
    const newUser =this.userRepository.create({
      email:signupDto.email,
      password:signupDto.password,
      otpHash:hashedOtp,
      name:signupDto.name,
      avatar:signupDto.avatar
    })
     const saveUser = await this.userRepository.save(newUser)
    await this.emailService.sendConfirmationEmail(signupDto.email, otp);
    delete saveUser.password
    return saveUser
  }
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const user = await this.findUserEmail(email)
    if (!user) {
      return false; // Người dùng không tồn tại
    }
    // Băm mã OTP mà người dùng nhập vào và so sánh với mã OTP đã lưu trữ
    return await compare(otp, user.otpHash);
  }
   generateOTP():string  {
    // Tạo mã OTP ngẫu nhiên, bạn có thể sử dụng các thư viện như `crypto` hoặc tự tạo
    const otpLength = 6; // Độ dài của mã OTP
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }
  async signin(signinDto:signinDto):Promise<UserEntity>{
    const userExist = await this.userRepository.createQueryBuilder('users').addSelect('users.password').where('users.email=:email',{email:signinDto.email}).getOne()
    if(!userExist) throw new BadRequestException('Bad Creaditial')
    const matchPassword = await compare(signinDto.password,userExist.password)
    if(!matchPassword) throw new BadRequestException('wrong password')
    userExist.isActive = true;
    delete userExist.password
    const loginEvent = new UserLoggedInEvent(userExist.id , new Date())
    this.eventEmiiter.emit('user.loggedin',loginEvent)
    return userExist
  }
  async findUserEmail(email:string):Promise<UserEntity>{
    return await this.userRepository.findOneBy({email})
  }
  async accessToken(user:UserEntity){
    return sign({
      id:user.id,
      email:user.email
    },process.env.ACCESSTOKEN_SERECT ,{expiresIn:process.env.ACCESSTOKEN_TIME})
  }
  async refreshToken(user:UserEntity,res:Response){
    const refreshToken =  sign({
      id:user.id,
    },process.env.REFRESHTOKEN_SERECT ,{expiresIn:process.env.REFRESHTOKEN_TIME})
    res.cookie('refreshToken',refreshToken)
  }
  async findAll(query: FilterUserDto): Promise<any> {
    const items_per_page = Number(query.items_per_page) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * items_per_page;
    const keyword = query.search || '';
    const [res, total] = await this.userRepository.findAndCount({
        where: [
            { name: Like('%' + keyword + '%') },
            { email: Like('%' + keyword + '%') }
        ],
         order: { createdAt: "DESC" },
        take: items_per_page,
        skip: skip,
        select: ['id','name' , 'email' , 'roles' , 'createdAt' , 'updatedAt']
    })
    const lastPage = Math.ceil(total / items_per_page);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data: res,
      total,
      currentPage: page,
      nextPage,
      prevPage,
      lastPage
  }
  }
  async findOne(id: number): Promise<UserEntity> {
    const user = await  this.userRepository.findOneBy({ id })
    if(!user) throw new NotFoundException('user not found')
    return user
  }
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }
  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateAvatar(id: number, avatar: string): Promise<UpdateResult> {
    return await this.userRepository.update(id, { avatar });
}

  async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  async compareHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.findUserEmail(email);
    if (user) {
      const resetToken = jwt.sign({email},process.env.ACCESSTOKEN_SERECT,{expiresIn:'1h'})
      user.resetToken = resetToken;
      await this.userRepository.save(user);

      await this.sendResetPasswordEmail(user.email, resetToken);
    }
  }
  async sendResetPasswordEmail(email: string, resetToken: string): Promise<void> {
    const transporter = nodemailer.createTransport({
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

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset your password',
      text: `Please click on the following link to reset your password: ${resetToken}`,
      html: `<p>Please click <a href="${resetToken}">here</a> to reset your password</p>`,
    };

    await transporter.sendMail(mailOptions);
  }
  async resetPassword(email: string, password: string): Promise<void> {
    const user = await this.findUserEmail(email);
    if (user) {
      const hashedPassword = await this.generateHash(password);
      user.password = hashedPassword;
      user.resetToken = null;
      await this.userRepository.save(user);
    }
    
  }

  async findByUsername(name: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({name});
  }
}
