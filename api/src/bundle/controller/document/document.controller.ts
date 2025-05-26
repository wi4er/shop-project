import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DocumentEntity } from '../../model/document.entity';
import { DocumentInput } from '../../input/document.input';
import { DocumentInsertOperation } from '../../operation/document-insert.operation';
import { DocumentUpdateOperation } from '../../operation/document-update.operation';
import { DocumentDeleteOperation } from '../../operation/document-delete.operation';
import { CheckAccess } from '../../../personal/guard/check-access.guard';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { CheckId } from '../../../common/guard/check-id.guard';
import { DocumentRender } from '../../render/document.render';

@Controller('bundle/document')
export class DocumentController {

  relations = {
    string: {attribute: true, lang: true},
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
    return new DocumentRender(item)
  }

  @Get()
  @CheckAccess(AccessTarget.DOCUMENT, AccessMethod.GET)
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
  @CheckAccess(AccessTarget.DOCUMENT, AccessMethod.GET)
  async getCount() {
    return this.docRepo.count().then(count => ({count}));
  }

  @Get(':id')
  @CheckId(DocumentEntity)
  @CheckAccess(AccessTarget.DOCUMENT, AccessMethod.GET)
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.docRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  @CheckAccess(AccessTarget.DOCUMENT, AccessMethod.POST)
  async addItem(
    @Body()
      input: DocumentInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new DocumentInsertOperation(trans).save(input)
        .then(id => trans.getRepository(DocumentEntity).findOne({
          where: {id},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Put(':id')
  @CheckId(DocumentEntity)
  @CheckAccess(AccessTarget.DOCUMENT, AccessMethod.PUT)
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: DocumentInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new DocumentUpdateOperation(trans).save(id, input)
        .then(id_2 => trans.getRepository(DocumentEntity).findOne({
          where: {id},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Delete(':id')
  @CheckId(DocumentEntity)
  @CheckAccess(AccessTarget.DOCUMENT, AccessMethod.DELETE)
  deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      trans => new DocumentDeleteOperation(trans).save([id]),
    );
  }

}
