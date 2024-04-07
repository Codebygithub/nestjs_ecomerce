import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('createContact/:userId')
  async sendMessage(@Body() createContactDto:CreateContactDto,@Param('userId') userId:string ) {
    const res  = await this.contactService.sendMessage(createContactDto,+userId)
    return res
  }
  
}