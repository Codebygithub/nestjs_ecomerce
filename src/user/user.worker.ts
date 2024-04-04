import { Process, Processor } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { Repository } from "typeorm";
import { Logger } from "@nestjs/common";
import { createUserDto } from "./dto/create-user.dto";
import { Job } from "bull";
import * as bcrypt from 'bcrypt';


Processor('user')
export class UserWorker {
  
  constructor
    (@InjectRepository(UserEntity) private userRepository:Repository<UserEntity>) {}

  private readonly logger = new Logger(UserWorker.name);
@Process('createUserByAdmin')
async createUserByAdmin(job:Job<createUserDto>){
    const hashPassword = bcrypt.hash(job.data.password,10)
    const res = await this.userRepository.save({...createUserDto , password :await hashPassword})
    


    this.logger.log(`Processing createUserByAdmin job with data: ${job.data}`);
    return res
    

}

}
