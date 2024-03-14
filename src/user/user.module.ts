import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CacheModule, CacheModuleOptions,  } from '@nestjs/cache-manager';
import redisStore from "cache-manager-redis-store";
import { GoogleStrategy } from './google.strategy';
import { PassportModule } from '@nestjs/passport';
import { SesionSerialize } from './google-serialize';
import { EmailModule } from 'src/email/email.module';
import { BullModule } from '@nestjs/bull';



@Module({
  imports:[TypeOrmModule.forFeature([UserEntity],),
  CacheModule.register<CacheModuleOptions>({
    isGlobal:true,
    store: typeof(redisStore),
    host: 'localhost',
    port: 6379,
  }),EmailModule,
  BullModule.registerQueue({
    name:'send-mail'
  })
],
  controllers: [UserController],
  providers: [UserService,{
    provide:'AUTH_SERVICE',
    useClass:UserService
  },GoogleStrategy,
  SesionSerialize
  
],
  exports:[UserService]
})
export class UserModule {}
