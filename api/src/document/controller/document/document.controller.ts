import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DocumentEntity } from '../../model/document.entity';
import { DocumentInput } from '../../input/document.input';
import { DocumentInsertOperation } from '../../operation/document-insert.operation';
import { DocumentUpdateOperation } from '../../operation/document-update.operation';
import { DocumentDeleteOperation } from '../../operation/document-delete.operation';

@Controller('document')
export class DocumentController {

  relations = {
    string: {property: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(DocumentEntity)
    private docRepo: Repository<DocumentEntity>,
  ) {
  }

  toView(item: DocumentEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      property: [
        ...item.string.map(str => ({
          string: str.string,
          property: str.attribute.id,
          lang: str.lang?.id,
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
    return this.docRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.docRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: number,
  ) {
    return this.docRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  addItem(
    @Body()
      input: DocumentInput,
  ) {
    return this.entityManager.transaction(
      trans => new DocumentInsertOperation(trans).save(input)
        .then(id => trans.getRepository(DocumentEntity).findOne({
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
      input: DocumentInput,
  ) {
    return this.entityManager.transaction(
      trans => new DocumentUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(DocumentEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete(':id')
  deleteItem(
    @Param('id')
      id: number,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      trans => new DocumentDeleteOperation(trans).save([id]),
    );
  }

}
