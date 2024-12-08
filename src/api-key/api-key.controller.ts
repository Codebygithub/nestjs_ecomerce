import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';

@Controller('api-key')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post('create')
  create(@Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeyService.createKey(createApiKeyDto);
  }

  @Get(':id') 
  async findById(@Param('id') id:string) {
    const res =await this.apiKeyService.findKeyById(id)
    return res;
  }

  
}
