import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FlagEntity } from '../../model/flag/flag.entity';
import { FlagInput } from '../../input/flag/flag.input';
import { FlagInsertOperation } from '../../operation/flag/flag-insert.operation';
import { FlagUpdateOperation } from '../../operation/flag/flag-update.operation';
import { FlagDeleteOperation } from '../../operation/flag/flag-delete.operation';
import { FlagPatchOperation } from '../../operation/flag/flag-patch.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { FlagRender } from '../../view/flag.render';
import { CheckAccess } from '../../../personal/guard/check-access.guard';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { CheckId } from '../../../common/guard/check-id.guard';

@Controller('flag')
export class FlagController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
  } as FindOptionsRelations<FlagEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(FlagEntity)
    private flagRepo: Repository<FlagEntity>,
  ) {
  }

  toView(item: FlagEntity) {
    return new FlagRender(item);
  }

  @Get()
  @CheckAccess(AccessTarget.FLAG, AccessMethod.GET)
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    const list = await this.flagRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    });

    return list.map(this.toView);
  }

  @Get('count')
  @CheckAccess(AccessTarget.FLAG, AccessMethod.GET)
  async getCount() {
    const count = await this.flagRepo.count();

    return ({count});
  }

  @Get(':id')
  @CheckId(FlagEntity)
  @CheckAccess(AccessTarget.FLAG, AccessMethod.GET)
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.toView(
      await this.flagRepo.findOne({
        where: {id},
        relations: this.relations,
      }),
    );
  }

  @Post()
  @CheckAccess(AccessTarget.FLAG, AccessMethod.POST)
  async addItem(
    @Body()
      input: FlagInput,
  ) {
    return this.toView(
      await this.entityManager.transaction(
        trans => new FlagInsertOperation(trans).save(input)
          .then(id => trans.getRepository(FlagEntity).findOne({
            where: {id},
            relations: this.relations,
          })),
      ),
    );
  }

  @Put(':id')
  @CheckAccess(AccessTarget.FLAG, AccessMethod.PUT)
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: FlagInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new FlagUpdateOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(FlagEntity).findOne({
          where: {id: updatedId},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Patch(':id')
  @CheckId(FlagEntity)
  @CheckAccess(AccessTarget.FLAG, AccessMethod.PUT)
  async updateFields(
    @Param('id')
      id: string,
    @Body()
      input: FlagInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new FlagPatchOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(FlagEntity).findOne({
          where: {id: updatedId},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Delete('/:id')
  @CheckId(FlagEntity)
  @CheckAccess(AccessTarget.FLAG, AccessMethod.DELETE)
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      async trans => new FlagDeleteOperation(trans).save([id]),
    );
  }

}
