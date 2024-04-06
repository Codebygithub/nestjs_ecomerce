import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data_source';
import { UserModule } from './user/user.module';
import { CurrentUserMiddleware } from './utility/middleware/currentUser.middleware';
import { ProductsModule } from './products/products.module';
import { ReviewModule } from './review/review.module';
import { OrderModule } from './order/order.module';
import { PassportModule } from '@nestjs/passport';
import { GiaohangnhanhModule } from './giaohangnhanh/giaohangnhanh.module';
import { ChatModule } from './chat/chat.module';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { CartModule } from './cart/cart.module';
import { EmailModule } from './email/email.module';
import { DiscountsModule } from './discounts/discounts.module';
import { FavoriteModule } from './favorite/favorite.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CategoriesModule } from './categories/categories.module';
import { ContactModule } from './contact/contact.module';


@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), 
    UserModule, 
    CategoriesModule, 
    ProductsModule, 
    ReviewModule, 
    OrderModule,
    PassportModule.register({session:true}),
    GiaohangnhanhModule,
     ChatModule, 
     EmailModule, 
     MyLoggerModule,
    ThrottlerModule.forRoot([{
      ttl:6000,
      limit:3
    }]),
    BullModule.forRoot({
      redis:{
        host:'localhost',
        port:6379
      }
      
    }),
    CartModule,
    DiscountsModule,
    FavoriteModule,
    CacheModule.register({
      isGlobal:true,
      store:redisStore,
      host:'localhost',
      port:6379
    }),
    ContactModule,
    
  
  ],
  controllers: [],
  providers: [{
    provide:APP_GUARD,
    useClass:ThrottlerGuard,
    
    
    
  },
{
  provide:APP_INTERCEPTOR,
  useClass:CacheInterceptor
}],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes({path:'*',method:RequestMethod.ALL});
  }

}
