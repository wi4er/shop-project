import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FileEntity } from '../../model/file.entity';
import { FileInput } from '../../input/File.input';
import { FileInsertOperation } from '../../operation/file-insert.operation';
import { FileUpdateOperation } from '../../operation/file-update.operation';
import { FileDeleteOperation } from '../../operation/file-delete.operation';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

interface FileFilter {

  collection?: string;

}

@Controller('file')
export class FileController {

  relations = {
    collection: true,
    string: {attribute: true, lang: true},
    flag: {flag: true},
  } as FindOptionsRelations<FileEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(FileEntity)
    private fileRepo: Repository<FileEntity>,
  ) {
  }

  toView(item: FileEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      original: item.original,
      mimetype: item.mimetype,
      path: item.path,
      collection: item.collection.id,
      attribute: [
        ...item.string.map(str => ({
          string: str.string,
          attribute: str.attribute.id,
          lang: str.lang?.id,
        })),
      ],
      flag: item.flag.map(fl => fl.flag.id),
    };
  }

  toWhere(filter: FileFilter): FindOptionsWhere<FileEntity> {
    const where = {};

    if (filter?.collection) {
      where['collection'] = {id: filter.collection};
    }

    return where;
  }

  @Get()
  getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
    @Query('filter')
      filter?: FileFilter,
  ) {
    return this.fileRepo.find({
      where: {
        ...(filter ? this.toWhere(filter) : {}),
      },
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  getCount(
    @Query('filter')
      filter?: FileFilter,
  ) {
    return this.fileRepo.count({
      where: {
        ...(filter ? this.toWhere(filter) : {}),
      },
    }).then(count => ({count}));
  }

  @Get(':id')
  getItem(
    @Param('id')
      id: number,
  ) {
    return this.fileRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(item => this.toView(
      NoDataException.assert(item, `File with id ${id} not found!`)
    ));
  }

  @Post()
  addItem(
    @Body()
      input: FileInput,
  ) {
    return this.entityManager.transaction(
      trans => new FileInsertOperation(trans).save(input)
        .then(id => trans.getRepository(FileEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  updateItem(
    @Param('id')
      id: number,
    @Body()
      input: FileInput,
  ) {
    return this.entityManager.transaction(
      trans => new FileUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(FileEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete('/:id')
  async deleteItem(
    @Param('id')
      id: number,
  ): Promise<number[]> {
    return this.entityManager.transaction(
      trans => new FileDeleteOperation(trans).save([id]),
    );
  }

}
