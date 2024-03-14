import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './entities/chat.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { CACHE_MODULE_OPTIONS, CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { UserModule } from 'src/user/user.module';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports:[TypeOrmModule.forFeature([ChatEntity]),UserModule,
  CacheModule.register<CacheModuleOptions>({
    isGlobal:true,
    store: typeof(redisStore),
    host: 'localhost',
    port: 6379,
  })

],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
