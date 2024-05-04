import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, Put } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Roles } from 'src/utility/common/user-role.enum';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { ContactEntity } from './entities/contact.entity';
import { filterContactDto } from './dto/filter-contact.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('createContact/:userId')
  @AuthorizeRoles(Roles.USER)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  async sendMessage(@Body() createContactDto:CreateContactDto,@Param('userId') userId:string ):Promise<ContactEntity> {
    const res  = await this.contactService.sendMessage(createContactDto,+userId)
    return res
  }

  @Get()
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  @UseInterceptors(CacheInterceptor)
  async findAll(@Query() query:filterContactDto): Promise<{
    data: ContactEntity[];
    total: number;
    currentPage: number;
    nextPage: number;
    prevPage: number;
    lastPage: number;
}>
 {
    const res = await this.contactService.findAll(query)
    return res;
  }

  @Get(':id')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param('id') id:string)
  {
    const res = await this.contactService.findOne(+id)
    return res ;
  }

  @Put(':id') 
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  async removeContact(@Param('id') id:string,@CurrentUser() currentUser:UserEntity):Promise<string> {
    const res = await this.contactService.remove(+id,currentUser)
    return res
  }


  
}
