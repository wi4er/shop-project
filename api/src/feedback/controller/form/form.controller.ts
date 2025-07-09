import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FormEntity } from '../../model/form/form.entity';
import { FormInput } from '../../input/form/form.input';
import { FormInsertOperation } from '../../operation/form/form-insert.operation';
import { FormUpdateOperation } from '../../operation/form/form-update.operation';
import { FormDeleteOperation } from '../../operation/form/form-delete.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { FormView } from '../../view/form.view';
import { CheckAccess } from '../../../personal/guard/check-access.guard';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { CheckId } from '../../../common/guard/check-id.guard';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FormPatchOperation } from '../../operation/form/form-patch.operation';

@Controller('feedback/form')
export class FormController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
    field: {field: true},
  } as FindOptionsRelations<FormEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(FormEntity)
    private formRepo: Repository<FormEntity>,
  ) {
  }

  @Get()
  @CheckAccess(AccessTarget.FORM, AccessMethod.GET)
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.formRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(item => new FormView(item)));
  }

  @Get('count')
  @CheckAccess(AccessTarget.FORM, AccessMethod.GET)
  async getCount() {
    return this.formRepo.count().then(count => ({count}));
  }

  @Get(':id')
  @CheckId(FormEntity)
  @CheckAccess(AccessTarget.FORM, AccessMethod.GET)
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.formRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(item => new FormView(item));
  }

  @Post()
  @CheckAccess(AccessTarget.FORM, AccessMethod.POST)
  async addItem(
    @Body()
      input: FormInput,
  ) {
    return this.entityManager.transaction(
      trans => new FormInsertOperation(this.entityManager).save(input)
        .then(id => trans.getRepository(FormEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(item => new FormView(item));
  }

  @Put(':id')
  @CheckId(FormEntity)
  @CheckAccess(AccessTarget.FORM, AccessMethod.PUT)
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: FormInput,
  ) {
    return this.entityManager.transaction(
      trans => new FormUpdateOperation(this.entityManager).save(id, input)
        .then(id => trans.getRepository(FormEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(item => new FormView(item));
  }

  @Patch(':id')
  @CheckId(FormEntity)
  @CheckAccess(AccessTarget.FORM, AccessMethod.PUT)
  async patchItem(
    @Param('id')
      id: string,
    @Body()
      input: FormInput,
  ) {
    return this.entityManager.transaction(
      trans => new FormPatchOperation(this.entityManager).save(id, input)
        .then(id => trans.getRepository(FormEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(item => new FormView(item));
  }

  @Delete(':id')
  @CheckId(FormEntity)
  @CheckAccess(AccessTarget.FORM, AccessMethod.DELETE)
  deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      trans => new FormDeleteOperation(this.entityManager).save([id]),
    );
  }

}
