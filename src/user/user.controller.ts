import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, UseInterceptors, UseGuards, UploadedFile, Req, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { signupDto } from './dto/user-signup.dto';
import { UserEntity } from './entities/user.entity';
import { signinDto } from './dto/user-signin.dto';
import { Request, Response } from 'express';
import { FilterUserDto } from './dto/filter-user.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { Roles } from 'src/utility/common/user-role.enum';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { createUserDto } from './dto/create-user.dto';
import { GoogleOAuthGuard } from './google-oauth.guard';
import { VerifyDto } from './dto/VerifyDto-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'src/utility/helper/configAvatar';
import { extname } from 'path';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('google/login')
  @UseGuards(GoogleOAuthGuard)
  handleLogin(){
    return {msg:'aaaaaa'}
  }

  //api/v1/user/google/redirect
  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  handleRedirect(){
    return {msg:'handle Redirect'}
  }
  @Get('status')
  user(@Req()req:Request ) {
    if(req.user) return {msg:'have user'}
    else{
      return {msg:'dont have user'}
    }
  }
  @Post('create-user')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async createUserByAdmin(@Body() createUserDto:createUserDto):Promise<UserEntity>{
    return await this.userService.createUserByAdmin(createUserDto)
  }
  @Get()
  async logOut(@Res({passthrough:true})res:Response):Promise<void>{
    this.userService.logOut(res)
  }
  @Post('signup')
  async signup(@Body() signupDto:signupDto):Promise<UserEntity>{
    return await this.userService.signup(signupDto)
  }
  @Post('signin')
  async signin(@Body() signinDto:signinDto , @Res({passthrough:true})res:Response):Promise<{
    user: UserEntity;
    accessToken: string;
    refreshToken:void
}>{
    const user = await this.userService.signin(signinDto)
    const accessToken = await this.userService.accessToken(user)
    const refreshToken = await this.userService.refreshToken(user,res)
    return {user,accessToken,refreshToken}
  }
  @Get('all')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @UseInterceptors(CacheInterceptor)
  findAll(@Query() query: FilterUserDto): Promise<UserEntity[]> {
    return this.userService.findAll(query);
}
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    return this.userService.findOne(+id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
 }
 @UseGuards(AuthenticationGuard)
 @UseInterceptors(CacheInterceptor)
 @Get('me')
 GetProfile(@CurrentUser() currentUser:UserEntity)
 {
  return currentUser
 }
 @Post('upload-avatar')
 @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @UseInterceptors(CacheInterceptor)
    @UseInterceptors(FileInterceptor('avatar', {
        storage: storageConfig('avatar'),
        fileFilter: (req, file, cb) => {
            const ext = extname(file.originalname);
            const allowedExtArr = ['.jpg', '.png', '.jpeg'];
            if (!allowedExtArr.includes(ext)) {
                req.fileValidationError = `Wrong extension type. Accepted file ext are: ${allowedExtArr.toString()}`;
                cb(null, false);
            } else {
                const fileSize = parseInt(req.headers['content-length']);
                if (fileSize > 1024 * 1024 * 5) {
                    req.fileValidationError = 'File size is too large. Accepted file size is less than 5 MB';
                    cb(null, false);
                } else {
                    cb(null, true);
                }
            }
        }
    }))
    uploadAvatar(@Req() req:any,@CurrentUser() currentUser:UserEntity, @UploadedFile() file: Express.Multer.File) {
        console.log("upload avatar");
        console.log('user data',currentUser.id )
        console.log(file);

        if (req.fileValidationError) {
            throw new BadRequestException(req.fileValidationError);
        }
        if (!file) { 
            throw new BadRequestException('File is required')
        }
        return this.userService.updateAvatar(currentUser.id, file.destination + '/' + file.filename);
    }

 @Post('forgot-password')
 @AuthorizeRoles(Roles.ADMIN)
 @UseGuards(AuthenticationGuard,AuthorizeGuard)
   async forgotPassword(@Body('email') email: string): Promise<void> {
    const res =  await this.userService.forgotPassword(email);
   // Gửi email thành công
     return res
 }
 @Post('reset-password')
 @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async resetPassword(@Body('email') email: string, @Body('password') password: string): Promise<void> {
    const res = await this.userService.resetPassword(email, password);
    // Password đã được reset thành công
    return res
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyDto:VerifyDto){
    const {email , otp} = verifyDto 
   if(!email  || !otp) throw new BadRequestException('Email or otp required')
    const isValidOtp = await this.userService.verifyOTP(email,otp)
    if(!isValidOtp) throw new BadRequestException('Invalid OTP')
    return isValidOtp
  }


}
