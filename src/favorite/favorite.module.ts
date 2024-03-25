import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteEntity } from './entities/favorite.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { ProductsModule } from 'src/products/products.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[TypeOrmModule.forFeature([FavoriteEntity,ProductEntity , UserEntity,]),ProductsModule , UserModule],
  controllers: [FavoriteController],
  providers: [FavoriteService],
  exports:[FavoriteService]
})
export class FavoriteModule {}
