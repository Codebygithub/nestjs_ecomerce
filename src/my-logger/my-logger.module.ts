import { Module } from '@nestjs/common';
import { MyLoggerService } from './my-logger.service';
import { MyLoggerController } from './my-logger.controller';

@Module({
  controllers: [MyLoggerController],
  providers: [MyLoggerService],
})
export class MyLoggerModule {}
