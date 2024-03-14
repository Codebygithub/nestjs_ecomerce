import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server, Socket } from 'socket.io';
import { ChatEntity } from './entities/chat.entity';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { Roles } from 'src/utility/common/user-role.enum';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { filterChatDto } from './dto/filter-chat.dto';

@WebSocketGateway({
  cors:{
    origin:'*'
  }
})
export class ChatGateway{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server:Server

  @SubscribeMessage('sendMessage')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async handleSendMessage(client:Socket,payload:ChatEntity):Promise<ChatEntity> {

    const sendMessage = await this.chatService.createMessage(payload)
    this.server.emit('payload' , payload)
    return sendMessage

  }
  @SubscribeMessage('updateMessage') 
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async handleUpdateMessage(@MessageBody() updateChatDto:UpdateChatDto,@CurrentUser() currentUser:UserEntity):Promise<ChatEntity>{
    try {
      const updateMessage = await this.chatService.updateMessage(updateChatDto.id,updateChatDto , currentUser)
      this.server.emit('update-message',updateMessage)
      return updateMessage
    } catch (error) {
      console.log(error)
    }
    
  }
  afterInit(server:Server){
    console.log(server)
  }
  handleDisconnect(client:Socket)
  {
    console.log('disconnect' , client.id)
  }

  handleConnect(client:Socket)
  {
    console.log('Connect' , client.id)
  }

  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @UseInterceptors(CacheInterceptor)
  @SubscribeMessage('findAllChat')
  async findAll(@MessageBody() filterChatDto:filterChatDto) {
    const res = await this.chatService.getMessage(filterChatDto);
    this.server.emit('getAll-message',res)
    return res
  }

  @SubscribeMessage('findOneChat')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @UseInterceptors(CacheInterceptor)
  async findOne(@MessageBody() id: number) {
    const res = await this.chatService.findOne(id);
    this.server.emit('getOne-message',res)
    return res
  }

  

  @SubscribeMessage('removeChat')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async remove(@MessageBody() id: number, @CurrentUser() currentUser:UserEntity):Promise<ChatEntity> {
    const res = await this.chatService.remove(id,currentUser);
    this.server.emit('remove', res)
    return res
  }
}
