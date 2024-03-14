import { Module } from '@nestjs/common';
import { GiaohangnhanhService } from './giaohangnhanh.service';
import { GiaohangnhanhController } from './giaohangnhanh.controller';
import { HttpModule } from '@nestjs/axios';
import { AxiosHeaders } from 'axios';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';

@Module({
  imports:[HttpModule,AxiosHeaders,
    CacheModule.register<CacheModuleOptions>({
      isGlobal:true,
      store: typeof(redisStore),
      host: 'localhost',
      port: 6379,
    }),
  
  ],
  controllers: [GiaohangnhanhController],
  providers: [GiaohangnhanhService],
})
export class GiaohangnhanhModule {}
