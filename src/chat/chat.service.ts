import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatEntity } from './entities/chat.entity';
import { Like, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { filterChatDto } from './dto/filter-chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatEntity) private readonly chatRepository:Repository<ChatEntity>,
    private readonly userService:UserService
  
  ){}
  async createMessage(chat:ChatEntity){
    return this.chatRepository.save(chat)
  }

  async updateMessage(id:number,updateChatDto: UpdateChatDto,currentUser:UserEntity): Promise<ChatEntity> {
    const message = await this.chatRepository.findOneBy({ id });
    if (!message) {
      throw new Error('Message not found');
    }
    if(currentUser.id !== updateChatDto.id)
    {
      throw new BadRequestException('you are not owner message')
    }
    Object.assign(message, updateChatDto);
    message.text = updateChatDto.message
    message.user =currentUser 

    return await this.chatRepository.save(message);
  }
  
    

  async getMessage(filterChatDto:filterChatDto) {
    
    const keyword = filterChatDto.keyword || ''
    const  [res , total] = await this.chatRepository.findAndCount({
      where:[
          {text:Like('%'+keyword +'&')}
      ],
      order:{createdAt:"DESC"},
      relations:{user:true},
      select:['id','email','user','text','createdAt']
    })
    return {
      data:res , 
      total
    }
  }

  async findOne(id: number) {
    const message = await this.chatRepository.findOne({
      where:{id},
      relations:{user:true},
      select:{
        user:{
          id:true,
          name:true
        }
      }
    })
    if(!message) throw new NotFoundException('message not found') 
    return message
    }

  

  async remove(id: number,currentUser:UserEntity):Promise<ChatEntity> {
    const message = await this.findOne(id)
    if(!message) throw new NotFoundException('message not found')
    
  if(currentUser.id !== id ) throw new BadRequestException('youRe not owner this message')

  let newMessage = await this.chatRepository.remove(message)
  
  newMessage.user = currentUser
  return newMessage;

  }
}
