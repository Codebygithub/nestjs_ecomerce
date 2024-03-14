import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { ProductEntity } from 'src/products/entities/product.entity';

@Entity()
export class CartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;
 
  @ManyToOne(() => UserEntity, user => user.cart)
  user: UserEntity;

  @ManyToOne(() => ProductEntity, product => product.cart)
  product: ProductEntity;


}

