import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from'express-session'
import * as passport from 'passport'
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.use(session({
    secret:'adasdasdgdgsdfgdfgsdfgsdfg',
    resave:false,
    saveUninitialized: false,
    cookie:{
      maxAge:600000
    }
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix('api/v1') 
  await app.listen(3000);
}
bootstrap();
