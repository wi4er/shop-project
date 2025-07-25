import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LangEntity } from '../../model/lang/lang.entity';
import { FlagInput } from '../../input/flag/flag.input';
import { LangInput } from '../../input/lang/lang.input';
import { LangInsertOperation } from '../../operation/lang/lang-insert.operation';
import { LangUpdateOperation } from '../../operation/lang/lang-update.operation';
import { LangDeleteOperation } from '../../operation/lang/lang-delete.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { LangView } from '../../view/lang.view';
import { CheckAccess } from '../../../personal/guard/check-access.guard';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { CheckId } from '../../../common/guard/check-id.guard';
import { LangPatchOperation } from '../../operation/lang/lang-patch.operation';

@Controller('settings/lang')
export class LangController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
  } as FindOptionsRelations<LangEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(LangEntity)
    private langRepo: Repository<LangEntity>,
  ) {
  }

  @Get()
  @CheckAccess(AccessTarget.LANG, AccessMethod.GET)
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.langRepo.find({
      relations: this.relations,
      order: {
        sort: 'DESC',
        updated_at: 'DESC',
      },
      take: limit,
      skip: offset,
    }).then(list => list.map(item => new LangView(item)));
  }

  @Get('count')
  @CheckAccess(AccessTarget.LANG, AccessMethod.GET)
  async countList() {
    return this.langRepo.count().then(count => ({count}));
  }

  @Get(':id')
  @CheckId(LangEntity)
  @CheckAccess(AccessTarget.LANG, AccessMethod.GET)
  async getItem(
    @Param('id')
      id: string,
  ) {
    const item = await this.langRepo.findOne({
      where: {id},
      relations: this.relations,
    });

    return new LangView(item);
  }

  @Post()
  @CheckAccess(AccessTarget.LANG, AccessMethod.POST)
  async addItem(
    @Body()
      input: LangInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new LangInsertOperation(trans).save(input)
        .then(id => trans.getRepository(LangEntity).findOne({
          where: {id},
          relations: this.relations,
        })));

    return new LangView(item);
  }

  @Put(':id')
  @CheckId(LangEntity)
  @CheckAccess(AccessTarget.LANG, AccessMethod.PUT)
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: FlagInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new LangUpdateOperation(trans).save(id, input)
        .then(langId => trans.getRepository(LangEntity).findOne({
          where: {id: langId},
          relations: this.relations,
        })));

    return new LangView(item);
  }

  @Patch(':id')
  @CheckId(LangEntity)
  @CheckAccess(AccessTarget.LANG, AccessMethod.PUT)
  async updateField(
    @Param('id')
      id: string,
    @Body()
      input: FlagInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new LangPatchOperation(trans).save(id, input)
        .then(langId => trans.getRepository(LangEntity).findOne({
          where: {id: langId},
          relations: this.relations,
        })));

    return new LangView(item);
  }

  @Delete('/:id')
  @CheckId(LangEntity)
  @CheckAccess(AccessTarget.LANG, AccessMethod.DELETE)
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      async trans => new LangDeleteOperation(trans).save([id]),
    );
  }

}
