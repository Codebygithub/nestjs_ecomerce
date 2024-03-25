import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { AddFavoriteDto } from './dto/create-favorite.dto';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  async addtoFav(@Body() addFavoriteDto:AddFavoriteDto ) {
    const res = await this.favoriteService.addtoFav(addFavoriteDto)
    return res;
  }

  @Delete(':userId/:productId')
  async removeFromFavorites(@Param('userId') userId: number, @Param('productId') productId: number) {
    return this.favoriteService.removeFromFavorites(userId, productId);
  }
}
