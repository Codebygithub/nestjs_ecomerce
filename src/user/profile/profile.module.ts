import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UserEntity } from '../entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [ProfileService],
  controllers: []
})
export class ProfileModule {}
