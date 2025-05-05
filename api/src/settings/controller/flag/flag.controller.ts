import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FlagEntity } from '../../model/flag.entity';
import { FlagInput } from '../../input/flag.input';
import { FlagInsertOperation } from '../../operation/flag/flag-insert.operation';
import { FlagUpdateOperation } from '../../operation/flag/flag-update.operation';
import { FlagDeleteOperation } from '../../operation/flag/flag-delete.operation';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { FlagPatchOperation } from '../../operation/flag/flag-patch.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { FlagRender } from '../../render/flag.render';
import { ElementEntity } from '../../../content/model/element.entity';

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
  getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.flagRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  getCount() {
    return this.flagRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.toView(
      NoDataException.assert(
        await this.flagRepo.findOne({
          where: {id},
          relations: this.relations,
        }),
        `Flag with id >> ${id} << not found`,
      ),
    );
  }

  @Post()
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
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      async trans => {
        NoDataException.assert(
          await trans.getRepository(FlagEntity).findOne({where: {id}}),
          `Flag with id >> ${id} << not found!`,
        );

        return new FlagDeleteOperation(trans).save([id]);
      },
    );
  }

}
