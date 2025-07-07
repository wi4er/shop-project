import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { LangEntity } from '../../model/lang/lang.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CheckAccess } from '../../../personal/guard/check-access.guard';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { CheckId } from '../../../common/guard/check-id.guard';
import { FieldEntity } from '../../model/field/field.entity';
import { FieldInsertOperation } from '../../operation/field/field-insert.operation';
import { FieldView } from '../../view/field.view';
import { FieldInput } from '../../input/field/field.input';
import { FieldPatchOperation } from '../../operation/field/field-patch.operation';
import { FieldDeleteOperation } from '../../operation/field/field-delete.operation';
import { FieldUpdateOperation } from '../../operation/field/field-update.operation';

@Controller('settings/field')
export class FieldController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
  } as FindOptionsRelations<FieldEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(FieldEntity)
    private fieldRepo: Repository<FieldEntity>,
  ) {
  }

  @Get()
  @CheckAccess(AccessTarget.FIELD, AccessMethod.GET)
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.fieldRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(item => new FieldView(item)));
  }

  @Get('count')
  @CheckAccess(AccessTarget.FIELD, AccessMethod.GET)
  async countList() {
    return this.fieldRepo.count().then(count => ({count}));
  }

  @Get(':id')
  @CheckId(FieldEntity)
  @CheckAccess(AccessTarget.FIELD, AccessMethod.GET)
  async getItem(
    @Param('id')
      id: string,
  ) {
    const item = await this.fieldRepo.findOne({
      where: {id},
      relations: this.relations,
    });

    return new FieldView(item);
  }

  @Post()
  @CheckAccess(AccessTarget.FIELD, AccessMethod.POST)
  async addItem(
    @Body()
      input: FieldInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new FieldInsertOperation(trans).save(input)
        .then(id => trans.getRepository(FieldEntity).findOne({
          where: {id},
          relations: this.relations,
        })));

    return new FieldView(item);
  }

  @Put(':id')
  @CheckId(FieldEntity)
  @CheckAccess(AccessTarget.FIELD, AccessMethod.PUT)
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: FieldInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new FieldUpdateOperation(trans).save(id, input)
        .then(langId => trans.getRepository(FieldEntity).findOne({
          where: {id: langId},
          relations: this.relations,
        })));

    return new FieldView(item);
  }

  @Patch(':id')
  @CheckId(FieldEntity)
  @CheckAccess(AccessTarget.FIELD, AccessMethod.PUT)
  async updateField(
    @Param('id')
      id: string,
    @Body()
      input: FieldInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new FieldPatchOperation(trans).save(id, input)
        .then(langId => trans.getRepository(FieldEntity).findOne({
          where: {id: langId},
          relations: this.relations,
        })));

    return new FieldView(item);
  }

  @Delete('/:id')
  @CheckId(LangEntity)
  @CheckAccess(AccessTarget.FIELD, AccessMethod.DELETE)
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      async trans => new FieldDeleteOperation(trans).save([id]),
    );
  }

}
