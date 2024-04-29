import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors,Header } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Roles } from 'src/utility/common/user-role.enum';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { BlogEntity } from './entities/blog.entity';
import { filterTitleDto } from './dto/filter-title.dto';
import { ValidTitleGuard } from 'src/utility/guard/ValidTitleGuard.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { filterBlogDto } from './dto/filter-blog.dto';
import { Request, Response } from 'express';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('createBlog')
  @AuthorizeRoles(Roles.USER,Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard,ValidTitleGuard)
  async create(@Body() createBlogDto: CreateBlogDto , @CurrentUser() currentUser:UserEntity):Promise<BlogEntity> {
      const res = await this.blogService.create(createBlogDto,currentUser);
      return res
  }

  @Get()
  @AuthorizeRoles(Roles.USER,Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  findAll(@Query() query:filterBlogDto) {
    return this.blogService.findAll(query);
  }
  @Get('search')
  @UseInterceptors(CacheInterceptor)
  async findByTitle(@Query() query:filterTitleDto):Promise<BlogEntity[]> {
    const res = await this.blogService.findByTitle(query)
    return res
  }

  @Get(':id')
  @AuthorizeRoles(Roles.USER,Roles.ADMIN)
  @UseInterceptors(CacheInterceptor)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async findOne(@Param('id') id: string): Promise<BlogEntity> {
    const res = await this.blogService.findOne(+id);
    return res
  }

  @Patch(':id')
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @AuthorizeRoles(Roles.USER,Roles.ADMIN)
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto,currentUser:UserEntity): Promise<BlogEntity> {
    const res =  this.blogService.update(+id, updateBlogDto,currentUser);
    return res
  }

 @Get(':userId/viewed-blog/:blogId')
 @Header('Cache-Control','max-age=3600')
 @AuthorizeRoles(Roles.USER,Roles.ADMIN)
 @UseInterceptors(CacheInterceptor)
 @UseGuards(AuthenticationGuard,AuthorizeGuard)
 async getViewBlogByUser(@Param('userId') userId:string,@Param('blogId') blogId:string):Promise<BlogEntity[]> {
  const viewBlog = await this.blogService.getViewBlogByUser(+userId , +blogId)
  console.log('view blog' , viewBlog)
  return viewBlog
 }


  @Delete(':id')
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @AuthorizeRoles(Roles.USER,Roles.ADMIN)
  async remove(@Param('id') id: string , @CurrentUser() currentUser:UserEntity):Promise<BlogEntity> {
    return this.blogService.remove(+id,currentUser);
  }
}
