import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MyLoggerService } from './my-logger.service';
import { CreateMyLoggerDto } from './dto/create-my-logger.dto';
import { UpdateMyLoggerDto } from './dto/update-my-logger.dto';

@Controller('my-logger')
export class MyLoggerController {
  constructor(private readonly myLoggerService: MyLoggerService) {}

  
}
