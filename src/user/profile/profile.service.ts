import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../dto/update-user.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class ProfileService {
    constructor(@InjectRepository(UserEntity) private readonly userRepository:Repository<UserEntity> ,
                                              private readonly emailService:EmailService
) {}

    async updateUser(id:number , updateUserDto:UpdateUserDto){
        const {name , email} =updateUserDto as UpdateUserDto    
        const userUpdate = await this.userRepository.update(id,{name,email})
        await this.emailService.sendUpdateEmail(email)
        return userUpdate
    }

}
