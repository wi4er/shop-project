import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PropertyInsertOperation } from '../../../common/operation/property-insert.operation';
import { FlagInsertOperation } from '../../../common/operation/flag-insert.operation';
import { PropertyUpdateOperation } from '../../../common/operation/property-update.operation';
import { FlagUpdateOperation } from '../../../common/operation/flag-update.operation';
import { UserGroupEntity } from '../../model/user-group.entity';
import { UserGroupInput } from '../../input/user-group.input';
import { UserGroup2stringEntity } from '../../model/user-group2string.entity';
import { UserGroup2flagEntity } from '../../model/user-group2flag.entity';

@Injectable()
export class GroupService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager,
    @InjectRepository(UserGroupEntity)
    private groupRepo: Repository<UserGroupEntity>,
  ) {
  }

  async insert(input: UserGroupInput): Promise<UserGroupEntity> {
    const created = new UserGroupEntity();

    await this.manager.transaction(async (trans: EntityManager) => {
      created.id = input.id;
      await trans.save(created);

      await new PropertyInsertOperation(trans, UserGroup2stringEntity).save(created, input);
      await new FlagInsertOperation(trans, UserGroup2flagEntity).save(created, input);
    });

    return this.groupRepo.findOne({
      where: { id: created.id },
      loadRelationIds: true,
    });
  }

  async update(input: UserGroupInput): Promise<UserGroupEntity> {
    await this.manager.transaction(async (trans: EntityManager) => {
      const beforeItem = await this.groupRepo.findOne({
        where: { id: input.id },
        relations: {
          string: { property: true },
          flag: { flag: true },
        },
      });
      await beforeItem.save();

      await new PropertyUpdateOperation(trans, UserGroup2stringEntity).save(beforeItem, input);
      await new FlagUpdateOperation(trans, UserGroup2flagEntity).save(beforeItem, input);
    });

    return this.groupRepo.findOne({
      where: { id: input.id },
      loadRelationIds: true,
    });
  }

  async delete(id: string[]): Promise<string[]> {
    const result = [];
    const list = await this.groupRepo.find({ where: { id: In(id) } });

    for (const item of list) {
      await this.groupRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}
