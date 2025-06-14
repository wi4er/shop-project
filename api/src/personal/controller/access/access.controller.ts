import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AccessEntity } from '../../model/access/access.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { AccessView } from '../../view/access.view';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { AccessInput } from '../../input/access/access.input';
import { AccessInsertOperation } from '../../operation/access/access-insert.operation';
import { AccessUpdateOperation } from '../../operation/access/access-update.operation';
import { AccessDeleteOperation } from '../../operation/access/access-delete.operation';
import { CheckId } from '../../../common/guard/check-id.guard';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AccessTarget } from '../../model/access/access-target';
import { NoDataException } from '../../../exception/no-data/no-data.exception';

export interface AccessGroup {

  target: AccessTarget;
  list: Array<AccessEntity>;

}

@Controller('personal/access')
export class AccessController {

  relations = {
    group: true,
  } as FindOptionsRelations<AccessEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(AccessEntity)
    private accessRepo: Repository<AccessEntity>,
  ) {
  }

  /**
   *
   */
  toView(item: AccessGroup): AccessView {
    const result = {};


    return new AccessView(item);
  }

  /**
   *
   */
  toGroup(list: Array<AccessEntity>): Array<AccessGroup> {
    const result: { [target: string]: AccessGroup } = {};

    for (const item of list) {
      if (!result[item.target]) {
        result[item.target] = {
          target: item.target,
          list: [item],
        };
      } else {
        result[item.target].list.push(item);
      }
    }

    return Object.values(result);
  }

  @Get()
  async getList() {
    return this.accessRepo.find()
      .then(list => {
        const group = this.toGroup(list);

        console.log(group);

        return group.map(this.toView);
      });
  }


  @Get(':id')
  async getItem(
    @Param('id')
      target: string,
  ) {
    return this.accessRepo.find({
      where: {
        target: NoDataException.assert(
          AccessTarget[target],
          `Wrong access target [${Reflect.ownKeys(AccessTarget).join(', ')}] expected!`,
        ),
      },
      relations: this.relations,
    }).then(list => {
      const item = this.toGroup(list)[0];

      return this.toView(item);
    });
  }

  @Put(':id')
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: AccessInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new AccessUpdateOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(AccessEntity).find({
          where: {
            target: NoDataException.assert(
              AccessTarget[id],
              `Wrong access target [${Reflect.ownKeys(AccessTarget).join(', ')}] expected!`,
            ),
          },
          relations: this.relations,
        })));

    return this.toView(this.toGroup(item)[0]);
  }

}
