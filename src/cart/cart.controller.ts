import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ParseIntPipe, Put } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-card.dto';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { Roles } from 'src/utility/common/user-role.enum';
import { CartEntity } from './entities/cart.entity';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { UpdateCartDto } from './dto/update-cart.dto';


@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  

  @Post('add')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @UseInterceptors(CacheInterceptor)
  async addToCart(@Body() addToCartDto:AddToCartDto): Promise<CartEntity>{
    const res = await this.cartService.addToCart(addToCartDto)
    return res
  }

  @Get(':userId')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @UseInterceptors(CacheInterceptor)
  async getCart(@Param('userId') userId:string): Promise<{
    cartItem: CartEntity[];
    totalQuantity:number,
    totalPrice:any;
  }>{
    const res = await this.cartService.getCart(+userId)
   
    return res
  }

  @Delete(':id')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async deleteCartInItem(@Param('id',ParseIntPipe) id:number,@CurrentUser() currentUser:UserEntity): Promise<CartEntity>{
    const res = await this.cartService.deleteCartInItem(id,currentUser)
    return res
  }
  @Put(':cartId')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async updateCart(@Param('cartId',ParseIntPipe) cartId:number , @Body() updateCartDto:UpdateCartDto,@CurrentUser() currentUser:UserEntity): Promise<CartEntity>{
    const res = await this.cartService.updateCart(cartId,updateCartDto,currentUser)
    return res 
    
  }

}
