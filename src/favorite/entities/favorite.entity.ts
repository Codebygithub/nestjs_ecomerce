// favorite.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { ProductEntity } from 'src/products/entities/product.entity';

@Entity()
export class FavoriteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.favorites)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column()
  favoriteAt:Date
}

