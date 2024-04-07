import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactEntity } from './contact.entity';
import { Like, MoreThanOrEqual, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { max } from 'class-validator';
import { log } from 'console';
import { filterContactDto } from './dto/filter-contact.dto';
import { UserEntity } from 'src/user/entities/user.entity';

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
    if(count >= maxContactPerDay) {
      throw new HttpException('Bạn đã gửi quá nhiều liên hệ trong ngày.', HttpStatus.TOO_MANY_REQUESTS);
    }
    const newContact = new ContactEntity()
    newContact.userContact = user
    newContact.email = user.email
    newContact.name = user.name 
    newContact.phone = createContactDto.phone
    newContact.message = createContactDto.message 
    newContact.createdAt=today
    newContact.contactCount++


    const save = await this.contactRepository.save(newContact)
    return save;

    
  }
  async findAll(query:filterContactDto): Promise<{
    data: ContactEntity[];
    total: number;
    currentPage: number;
    nextPage: number;
    prevPage: number;
    lastPage: number;
}>
{
    const items_per_page = Number(query.item_per_page) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * items_per_page;
    const keyword = query.search || '';

    const whereConditions:any = {
      email:Like(`%${keyword}%`),

    }
    if(query.email) {
      whereConditions.email = query.email
    }
    const [res , total] = await this.contactRepository.findAndCount({
      where:whereConditions ,
      take:items_per_page,
      skip,
      order:{createdAt:'DESC'},
      select:['email','id','name','userContact','message','updatedAt','createdAt']
    })
    const lastPage = Math.ceil(total/items_per_page)
    const nextPage = page + 1 > lastPage ? null : page + 1
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data: res, 
      total,
      currentPage:page,
      nextPage,
      prevPage,
      lastPage
    }
    
  }
  async remove(id:number,currentUser:UserEntity):Promise<string> {
    const contact = await this.findOne(id)
    if(!contact) throw new NotFoundException()
    const currentTime = new Date()
    
    const sentTime = contact.createdAt
    const differenceTime = ( currentTime.getTime() - sentTime.getTime()) /(1000*60)
    if(differenceTime > 3600000 )   
      throw new BadRequestException('CAN NOT REMOVE CONTACT')
    if(contact.retrievedAt && (currentTime.getTime() - sentTime.getTime()) / (1000*60) <=60) {
      contact.contactCount--;
      await this.contactRepository.save(contact)
    }
    else{ 
      await this.contactRepository.remove(contact)
    }
    contact.userContact = currentUser
    return 'CONTACT HAS BEEN REMOVED'

    
  }
  async findOne(id:number){
    const contact = await this.contactRepository.findOne({
      where:{id},
      relations:{userContact:true}
    })
    if(!contact) throw new NotFoundException('CONTACT NOT FOUND')

    return contact
    
  }

}
