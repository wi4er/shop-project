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
import { AccessRender } from '../../render/access.render';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { AccessInput } from '../../input/access.input';
import { AccessInsertOperation } from '../../operation/access/access-insert.operation';
import { AccessUpdateOperation } from '../../operation/access/access-update.operation';
import { AccessDeleteOperation } from '../../operation/access/access-delete.operation';
import { CheckId } from '../../../common/guard/check-id.guard';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AccessTarget } from '../../model/access/access-target';

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
  toView(item: AccessGroup): AccessRender {
    const result = {};


    return new AccessRender(item);
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
        target: WrongDataException.assert(
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

  // @Post()
  // async addItem(
  //   @Body()
  //     input: AccessInput,
  // ) {
  //   const item = await this.entityManager.transaction(
  //     trans => new AccessInsertOperation(trans).save(input)
  //       .then(id => trans.getRepository(AccessEntity).findOne({
  //         where: {id},
  //         relations: this.relations,
  //       })));
  //
  //   return this.toView(item);
  // }
  //
  // @Put(':id')
  // @CheckId(AccessEntity)
  // async updateItem(
  //   @Param('id')
  //     id: number,
  //   @Body()
  //     input: AccessInput,
  // ) {
  //   const item = await this.entityManager.transaction(
  //     trans => new AccessUpdateOperation(trans).save(id, input)
  //       .then(updatedId => trans.getRepository(AccessEntity).findOne({
  //         where: {id: updatedId},
  //         relations: this.relations,
  //       })));
  //
  //   return this.toView(item);
  // }
  //
  // @Delete(':id')
  // @CheckId(AccessEntity)
  // async deleteItem(
  //   @Param('id')
  //     id: number,
  // ): Promise<number[]> {
  //   return this.entityManager.transaction(
  //     async trans => new AccessDeleteOperation(trans).save([id]),
  //   );
  // }

}
