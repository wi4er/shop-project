import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PropertyValueInsertOperation } from '../../../common/operation/property-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { PropertyValueUpdateOperation } from '../../../common/operation/property-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
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

      await new PropertyValueInsertOperation(trans, Flag2stringEntity).save(created, input);
      await new FlagValueInsertOperation(trans, Flag2flagEntity).save(created, input);
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

      await new PropertyValueUpdateOperation(trans, Flag2stringEntity).save(beforeItem, input);
      await new FlagValueUpdateOperation(trans, Flag2flagEntity).save(beforeItem, input);
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
