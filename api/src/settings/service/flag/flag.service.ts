import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PropertyInsertOperation } from '../../../common/operation/property-insert.operation';
import { FlagInsertOperation } from '../../../common/operation/flag-insert.operation';
import { PropertyUpdateOperation } from '../../../common/operation/property-update.operation';
import { FlagUpdateOperation } from '../../../common/operation/flag-update.operation';
import { FlagEntity } from '../../model/flag.entity';
import { FlagInput } from '../../input/flag.input';
import { Flag2stringEntity } from '../../model/flag2string.entity';
import { Flag2flagEntity } from '../../model/flag2flag.entity';

@Injectable()
export class FlagService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager,
    @InjectRepository(FlagEntity)
    private flagRepo: Repository<FlagEntity>,
  ) {
  }

  async insert(input: FlagInput): Promise<FlagEntity> {
    const created = new FlagEntity();

    await this.manager.transaction(async (trans: EntityManager) => {
      created.id = input.id;
      await trans.save(created);

      await new PropertyInsertOperation(trans, Flag2stringEntity).save(created, input);
      await new FlagInsertOperation(trans, Flag2flagEntity).save(created, input);
    });

    return this.flagRepo.findOne({
      where: { id: created.id },
      loadRelationIds: true,
    });
  }

  async update(input: FlagInput): Promise<FlagEntity> {
    await this.manager.transaction(async (trans: EntityManager) => {
      const beforeItem = await this.flagRepo.findOne({
        where: { id: input.id },
        relations: {
          string: { property: true },
          flag: { flag: true },
        },
      });
      await beforeItem.save();

      await new PropertyUpdateOperation(trans, Flag2stringEntity).save(beforeItem, input);
      await new FlagUpdateOperation(trans, Flag2flagEntity).save(beforeItem, input);
    });

    return this.flagRepo.findOne({
      where: { id: input.id },
      loadRelationIds: true,
    });
  }

  async delete(id: string[]): Promise<string[]> {
    const result = [];
    const list = await this.flagRepo.find({ where: { id: In(id) } });

    for (const item of list) {
      await this.flagRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}
