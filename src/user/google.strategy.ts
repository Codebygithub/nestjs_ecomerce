import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy,Profile } from "passport-google-oauth20";
import { UserService } from "./user.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){
  constructor(@Inject(UserService) private userService:UserService){
    super({
      clientID:process.env.GOOGLE_CLIENT_ID,
      clientSecret:process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:'http://localhost:3000/api/v1/user/google/redirect',
      scope:['profile','email']
    });
  }
  async validate(accessToken:string,refreshToken:string,profile:Profile){
    console.log('accessToken',accessToken)
    console.log('refreshToken',refreshToken)
    console.log('profile',profile)
    const user = await  this.userService.validate({email:profile.emails[0].value,name:profile.name[0]})
    return user;
  }
}