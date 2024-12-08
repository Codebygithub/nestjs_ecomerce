// check-order-status.middleware.ts
import { Injectable, NestMiddleware, NotFoundException, UnauthorizedException,  } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import {compare} from 'bcrypt'
import { ApiKeyService } from 'src/api-key/api-key.service';
const HEADER = {
  API_KEY :'x-api-key',

}
@Injectable()
export class checkApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly apiKeyService:ApiKeyService) {}

  async use(req: Request, res: Response, next: NextFunction)  {
    const apiKey = req.headers[HEADER.API_KEY];
    if(!apiKey) {
      throw new UnauthorizedException('something went wrong')
    }

    const keyExists =await this.apiKeyService.findKeyById(apiKey.toString())
    if(!keyExists) {
      throw new UnauthorizedException('Validate not correct')
    }
    next();

    
  }

  

  
  
}