import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKeyEntity } from './entities/api-key.entity';
import { Repository } from 'typeorm';
import {hash} from 'bcrypt'
import crypto from 'crypto'

@Injectable()
export class ApiKeyService {
  constructor(
  @InjectRepository(ApiKeyEntity) private apiKeyRepository: Repository<ApiKeyEntity>){}
  async createKey(createApiKeyDto: CreateApiKeyDto) {
    const newKey = this.apiKeyRepository.create(createApiKeyDto)
    await this.apiKeyRepository.save(newKey);
    return newKey
  }

  async findKeyById(key:string) {
    const foundKey = await this.apiKeyRepository.findOne({where:{key}})
    if(!foundKey) throw new NotFoundException('something went wrong')
    return foundKey
  }
  
}

  

