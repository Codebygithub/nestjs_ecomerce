import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactEntity } from './entities/contact.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { max } from 'class-validator';
import { log } from 'console';

@Injectable()
export class ContactService {
  constructor(@InjectRepository(ContactEntity) private readonly contactRepository:Repository<ContactEntity>,
                                               private readonly userService:UserService
){}


  async sendMessage(createContactDto:CreateContactDto,userId:number) {
    const user = await this.userService.findOne(userId)
    if(!user) throw new NotFoundException('USER NOT FOUND')
    const today = new Date()
    today.setHours(0,0,0,0)
  
    let contactHours = await this.contactRepository.createQueryBuilder('contact')
    .select('COUNT(*)', 'count')
    .where('contact.userContact = :userId', { userId: user.id })
    .andWhere('contact.createdAt >= :today', { today: today })
    .getRawOne();


  
    const count = parseInt(contactHours.count)
    console.log('counttt ',count)
    
    const maxContactPerDay = +process.env.MAXCONTACTPERDAY
    if(count > maxContactPerDay) {
      throw new HttpException('Bạn đã gửi quá nhiều liên hệ trong ngày.', HttpStatus.TOO_MANY_REQUESTS);
    }
    const newContact = new ContactEntity()
    newContact.userContact = user
    newContact.email = user.email
    newContact.name = user.name 
    newContact.message = createContactDto.message 

    const save = await this.contactRepository.save(newContact)
    return save;

    
  }
}
