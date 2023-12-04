import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PropertyValueInsertOperation } from '../../../common/operation/property-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { PropertyValueUpdateOperation } from '../../../common/operation/property-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
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

      await new PropertyValueInsertOperation(trans, UserGroup2stringEntity).save(created, input);
      await new FlagValueInsertOperation(trans, UserGroup2flagEntity).save(created, input);
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

      await new PropertyValueUpdateOperation(trans, UserGroup2stringEntity).save(beforeItem, input);
      await new FlagValueUpdateOperation(trans, UserGroup2flagEntity).save(beforeItem, input);
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
