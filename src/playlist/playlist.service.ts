import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaylistEntity } from './entities/playlist.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlaylistService {
  constructor(@InjectRepository(PlaylistEntity) private readonly plistRepository:Repository<PlaylistEntity>){}
  create(createPlaylistDto: CreatePlaylistDto) {
    return 'This action adds a new playlist';
  }

  findAll() {
    return `This action returns all playlist`;
  }

  findOne(id: number) {
    return `This action returns a #${id} playlist`;
  }

  update(id: number, updatePlaylistDto: UpdatePlaylistDto) {
    return `This action updates a #${id} playlist`;
  }

  async remove(id: number) {
    const playlist = await this.plistRepository.findOne({
      where:{id}
    })
    if(!playlist)
    throw new NotFoundException('PLAYLISH NOT FOUND')
    const res = await this.plistRepository.remove(playlist)

    return res
    
  }
}
