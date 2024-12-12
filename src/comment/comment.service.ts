import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEntity } from "./entities/comment.entity";
import { Between, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from "typeorm";
import { ProductEntity } from "src/products/entities/product.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CurrentUser } from "src/utility/decorators/currentUser.decorator";
import { NotFoundError } from "rxjs";
import { FilterCommentDto } from "./dto/filter-comment.dto";

@Injectable()
export class CommentService {
  constructor(@InjectRepository(CommentEntity) private readonly commentRepository:Repository<CommentEntity>,
              @InjectRepository(ProductEntity) private readonly productRepository:Repository<ProductEntity>,
             
  ) {}
  async creatComment(createCommentDto:CreateCommentDto,currentUser:UserEntity){
    const {productId, userId , content , parentCommentId} = createCommentDto
    const product = await this.productRepository.findOne({where:{id:productId}})
    const user = currentUser
    if(!product || !user) throw new NotFoundException('Produt or user not found')
    const comment = new CommentEntity()
    comment.product = product
    comment.user = user
    comment.content = content
    comment.parentComment = parentCommentId ? await this.commentRepository.findOne({where:{id:parentCommentId}}) :null
    let rightValue :number
    if(parentCommentId) {
      const parentComment = await this.commentRepository.findOne({where:{id:parentCommentId}})
      if(!parentComment) throw new NotFoundException('Parent comment not found')
      rightValue = parentComment.right
      await this.commentRepository.update(
        { product: product, right: MoreThanOrEqual(rightValue) },
        { right:() => "right + 2"}
      );
      await this.commentRepository.update(
        { product: product, left: MoreThan(rightValue) },  // Dùng MoreThanOrEqual
        { left: () => "left + 2" }
      );

    }
    else {
      const maxRightValue = await this.commentRepository.findOne({
        where:{product:product},
        order:{right:'DESC'}
      })
      rightValue=maxRightValue ?maxRightValue.right + 1 : 1 ;
    }
    comment.left= rightValue
    comment.right = rightValue + 1
    return this.commentRepository.save(comment)
  }
  async deleteComments(filterCommentDto:FilterCommentDto, currentUser:UserEntity
  ){
    const { productId , commentId} = filterCommentDto
    const product = await this.productRepository.findOne({where:{id:+productId}})
    const comment = await this.commentRepository.findOne({where:{id:+commentId}})
    if(!product || comment)  throw new NotFoundException('Product or comment not found')
    const leftValue = comment.left
    const rightValue = comment.right
    const width = rightValue - leftValue + 1 
    await this.commentRepository.delete({
      product: { id: +productId }, 
      left: Between(leftValue, rightValue), 
    });
    await this.commentRepository.createQueryBuilder()
      .update(CommentEntity)
      .set({ right: () => `"right" - ${width}` }) // Sử dụng phép toán
      .where('"productId" = :productId', { productId })
      .andWhere('"right" > :rightValue', { rightValue })
      .execute();

    // 3. Cập nhật giá trị `left` cho các bản ghi có `left > rightValue`
    await this.commentRepository.createQueryBuilder()
      .update(CommentEntity)
      .set({ left: () => `"left" - ${width}` }) // Sử dụng phép toán
      .where('"productId" = :productId', { productId })
      .andWhere('"left" > :rightValue', { rightValue })
      .execute();
  }

  async getAllCommentById({productId , limit = 50 , offset = 0 , parentCommentId = null}: FilterCommentDto ) {
    if(parentCommentId) {
      const parent = await this.commentRepository.findOne({
        where:{id:+parentCommentId}
      })
      if(!parent) throw new NotFoundException('Parent comment not found')
      const comments = await this.commentRepository.find({
        where:{
        product:{id:+productId},
        left:MoreThan(parent.left),
        right:LessThanOrEqual(parent.right)
        
      },
      order:{left:'ASC'} ,
      skip:offset,
      take:limit
      }
      
    )
    return comments;
    }
    const comments = await this.commentRepository.find({
      where:{
      product:{id:+productId},
      parentComment:null
      
    },
    order:{left:'ASC'} ,
    skip:offset,
    take:limit
    }
  )
  return comments



  }
  // return await this.productRepository.find({
  //   where: { isDraft: true },
  //   order: { updatedAt: 'DESC' },
  //   take: limit,
  //   skip: skip,
  // });

    

  }

  // //  await this.commentRepository.update(
  //   { product: product, right: MoreThanOrEqual(rightValue) },
  //   { right:() => "right + 2"}
  // );
  // await this.commentRepository.update(
  //   { product: product, left: MoreThan(rightValue) },  // Dùng MoreThanOrEqual
  //   { left: () => "left + 2" }
  // );



// await Comment.deleteMany({
//   comment_productId:productId,
//   comment_content:{$gte:leftValue , $lte:rightValue}
// })
// await Comment.updateMany({
//   comment_productId:productId,
//   comment_right:{$gt:rightValue}
// }, {
//   $inc:{comment_right;-width}
// })
// await Comment.updateMany({
//   comment_productId:productId,
//   comment_left:{$gt:rightValue}
// },{
//   $inc:{comment_right;-width}

// })