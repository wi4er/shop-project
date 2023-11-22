import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DirectoryEntity } from '../../model/directory.entity';
import { Repository } from 'typeorm';
import { DirectoryService } from '../../service/directory/directory.service';
import { DirectoryInput } from '../../input/directory.input';

@Controller('directory')
export class DirectoryController {

  relations = {
    string: {property: true, lang: true},
    flag: {flag: true},
    point: {point: {directory: true}, property: true},
  };

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
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.directoryRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.directoryRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  addItem(
    @Body()
      input: DirectoryInput,
  ) {
    return this.directoryService.insert(input)
      .then(res => this.directoryRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

  @Put(':id')
  updateItem(
    @Body()
      input: DirectoryInput,
  ) {
    return this.directoryService.update(input)
      .then(res => this.directoryRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

  @Delete()
  deleteItem() {

  }

}
