import { Module } from '@nestjs/common';
import { GiaohangnhanhService } from './giaohangnhanh.service';
import { GiaohangnhanhController } from './giaohangnhanh.controller';
import { HttpModule } from '@nestjs/axios';
import { AxiosHeaders } from 'axios';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { ProductsModule } from 'src/products/products.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports:[HttpModule,AxiosHeaders,ProductsModule,OrderModule,
   
  
  ],
  controllers: [GiaohangnhanhController],
  providers: [GiaohangnhanhService],
})
export class GiaohangnhanhModule {}
