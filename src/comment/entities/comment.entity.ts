import { ProductEntity } from 'src/products/entities/product.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';


@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductEntity, product => product.comments)
  @JoinColumn({ name: 'comment_productId' })
  product: ProductEntity;

  @ManyToOne(() => UserEntity, user => user.comments)
  @JoinColumn({ name: 'comment_userId' })
  user: UserEntity;

  @Column()
  content: string;

  @Column({ default: 0 })
  left: number;

  @Column({ default: 0 })
  right: number;

  @ManyToOne(() => CommentEntity, { nullable: true })
  @JoinColumn({ name: 'comment_parentId' })
  parentComment: CommentEntity;

  @Column({ default: false })
  isDeleted: boolean;
}
