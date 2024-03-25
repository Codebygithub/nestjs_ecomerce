import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoriteEntity } from './entities/favorite.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { ProductsService } from 'src/products/products.service';
import { AddFavoriteDto } from './dto/create-favorite.dto';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly favRepository:Repository<FavoriteEntity>,
    private readonly userService:UserService,
    private readonly productService:ProductsService
  ){}

  async addtoFav(addFavoriteDto:AddFavoriteDto  ){
    const {userId , productId} = addFavoriteDto
    const user = await this.userService.findOne(userId)
    if(!user ) throw new NotFoundException('USER NOT FOUND')
    const product = await this.productService.findOne(productId)
    if (!product) throw new NotFoundException('PRODUCT NOT FOUND');
    
    const existingUsage = await this.favRepository
    .createQueryBuilder('fav')
    .where('fav.productId = :productId', { productId: product.id })
    .andWhere('fav.userId = :userId', { userId: user.id })
    .getOne();
    if(existingUsage) throw new BadRequestException('ALREADY FAVORITE PRODUCT')
    else{
          const favorite = new FavoriteEntity()
          favorite.product = product
          favorite.user = user
          favorite.favoriteAt = new Date()
          return await this.favRepository.save(favorite)
          
        }
  }

}
