import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DirectoryEntity } from '../../model/directory.entity';
import { Repository } from 'typeorm';
import { DirectoryService } from '../../service/directory/directory.service';
import { DirectoryInput } from '../../input/directory.input';

@Controller('directory')
export class DirectoryController {

  constructor(
    @InjectRepository(DirectoryEntity)
    private directoryRepo: Repository<DirectoryEntity>,
    private directoryService: DirectoryService,
  ) {
  }

  toView(item: DirectoryEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      property: [
        ...item.string.map(str => ({
          string: str.string,
          property: str.property.id,
          lang: str.lang?.id,
        })),
        ...item.point.map(val => ({
          property: val.property.id,
          point: val.point.id,
          directory: val.point.directory.id,
        })),
      ],
      flag: item.flag.map(fl => fl.flag.id),
    };
  }

  @Get()
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.directoryRepo.find({
      relations: {
        string: {property: true, lang: true},
        flag: {flag: true},
        point: {point: {directory: true}, property: true},
      },
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Post()
  async addItem(
    @Body()
      input: DirectoryInput,
  ): Promise<DirectoryEntity> {
    return this.directoryService.insert(input);
  }

  @Put()
  updateItem(
    @Body()
      input: DirectoryInput,
  ) {
    return this.directoryService.update(input);
  }

  @Delete()
  deleteItem() {

  }

}
