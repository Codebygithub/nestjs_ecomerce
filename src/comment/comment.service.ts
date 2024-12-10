import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEntity } from "./entities/comment.entity";
import { MoreThan, MoreThanOrEqual, Repository } from "typeorm";
import { ProductEntity } from "src/products/entities/product.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CurrentUser } from "src/utility/decorators/currentUser.decorator";
import { NotFoundError } from "rxjs";

@Injectable()
export class CommentService {
  constructor(@InjectRepository(CommentEntity) private readonly commentRepository:Repository<CommentEntity>,
              @InjectRepository(ProductEntity) private readonly productRepository:Repository<ProductEntity>,
             
  ) {}
  async creatComment(createCommentDto:CreateCommentDto,currentUser:UserEntity){
    const {productId, userId , content , parentCommentId} = createCommentDto
    const product = await this.productRepository.findOne({where:{id:productId}})
    const user = currentUser
    if(!product || !user) throw new NotFoundError('Produt or user not found')
    const comment = new CommentEntity()
    comment.product = product
    comment.user = user
    comment.content = content
    comment.parentComment = parentCommentId ? await this.commentRepository.findOne({where:{id:parentCommentId}}) :null
    let rightValue :number
    if(parentCommentId) {
      const parentComment = await this.commentRepository.findOne({where:{id:parentCommentId}})
      if(!parentComment) throw new NotFoundError('Parent comment not found')
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
}