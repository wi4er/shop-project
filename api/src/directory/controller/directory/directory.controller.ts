import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DirectoryEntity } from '../../model/directory.entity';
import { EntityManager, Repository } from 'typeorm';
import { DirectoryInput } from '../../input/directory.input';
import { DirectoryInsertOperation } from '../../operation/directory-insert.operation';
import { DirectoryUpdateOperation } from '../../operation/directory-update.operation';
import { DirectoryDeleteOperation } from '../../operation/directory-delete.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

@Controller('directory')
export class DirectoryController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
    point: {point: {directory: true}, attribute: true},
  } as FindOptionsRelations<DirectoryEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(DirectoryEntity)
    private directoryRepo: Repository<DirectoryEntity>,
  ) {
  }

  toView(item: DirectoryEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      attribute: [
        ...item.string.map(str => ({
          string: str.string,
          attribute: str.attribute.id,
          lang: str.lang?.id,
        })),
        ...item.point.map(val => ({
          attribute: val.attribute.id,
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
    return this.entityManager.transaction(
      trans => new DirectoryInsertOperation(trans).save(input)
        .then(id => trans.getRepository(DirectoryEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  updateItem(
    @Param('id')
      id: string,
    @Body()
      input: DirectoryInput,
  ) {
    return this.entityManager.transaction(
      trans => new DirectoryUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(DirectoryEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete(':id')
  deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      trans => new DirectoryDeleteOperation(trans).save([id])
    );
  }

}
