import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { CollectionEntity } from '../../model/collection/collection.entity';
import { CollectionInsertOperation } from '../../operation/collection/collection-insert.operation';
import { CollectionUpdateOperation } from '../../operation/collection/collection-update.operation';
import { CollectionDeleteOperation } from '../../operation/collection/collection-delete.operation';
import { CollectionInput } from '../../input/collection/collection.input';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { CollectionView } from '../../view/collection.view';

@Controller('collection')
export class CollectionController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
  } as FindOptionsRelations<CollectionEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(CollectionEntity)
    private colRepo: Repository<CollectionEntity>,
  ) {
  }

  toView(item: CollectionEntity) {
    return new CollectionView(item);
  }

  @Get()
  getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.colRepo.find({
      relations: this.relations,
      order: {
        updated_at: 'DESC'
      },
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  getCount() {
    return this.colRepo.count().then(count => ({count}));
  }

  @Get(':id')
  getItem(
    @Param('id')
      id: string,
  ) {
    return this.colRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(item => this.toView(
      NoDataException.assert(item, `Collection with id ${id} not found!`),
    ));
  }

  @Post()
  addItem(
    @Body()
      input: CollectionInput,
  ) {
    return this.entityManager.transaction(
      trans => new CollectionInsertOperation(trans).save(input)
        .then(id => trans.getRepository(CollectionEntity).findOne({
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
      input: CollectionInput,
  ) {
    return this.entityManager.transaction(
      trans => new CollectionUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(CollectionEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete('/:id')
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      trans => new CollectionDeleteOperation(trans).save([id]),
    );
  }

}
