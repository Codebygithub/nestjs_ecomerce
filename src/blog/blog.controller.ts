import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
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
  findAll() {
    return this.blogService.findAll();
  }
  @Get('search')
  async findByTitle(@Query() query:filterTitleDto):Promise<BlogEntity[]> {
    const res = await this.blogService.findByTitle(query)
    return res
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(+id, updateBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}
