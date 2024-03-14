import { Injectable,ConsoleLogger } from '@nestjs/common';
import { CreateMyLoggerDto } from './dto/create-my-logger.dto';
import { UpdateMyLoggerDto } from './dto/update-my-logger.dto';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
  log(message: any, context?: string): void{
    const entry = `${message}t/${context}`
    super.log(message,context)
  }
  error(message: any, stackOrContext?: string): void{
    const entry = `${message}t/${stackOrContext}`
    super.error(message,stackOrContext)
  }
 
    
  
  
}
