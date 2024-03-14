import { Inject, Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { UserService } from "./user.service";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class SesionSerialize extends PassportSerializer {
    constructor(
        @Inject('AUTH_SERVICE') private readonly userService:UserService
    ){
        super()
    }
    async serializeUser(user:UserEntity, done:Function) {
        done(null,user)
    }
    
    deserializeUser(payload: any, done: Function) {
        const user = this.userService.findUser(payload.id)
        return user ? done(null,user) : done(null,null)
    }

}