import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PropertyInsertOperation } from '../../../common/operation/property-insert.operation';
import { FlagInsertOperation } from '../../../common/operation/flag-insert.operation';
import { PropertyUpdateOperation } from '../../../common/operation/property-update.operation';
import { FlagUpdateOperation } from '../../../common/operation/flag-update.operation';
import { LangEntity } from '../../model/lang.entity';
import { LangInput } from '../../input/lang.input';
import { Lang2stringEntity } from '../../model/lang2string.entity';
import { Lang2flagEntity } from '../../model/lang2flag.entity';

@Injectable()
export class LangService {


  constructor(
    @InjectEntityManager()
    private manager: EntityManager,
    @InjectRepository(LangEntity)
    private langRepo: Repository<LangEntity>,
  ) {
  }

  async insert(input: LangInput): Promise<LangEntity> {
    const created = new LangEntity();

    await this.manager.transaction(async (trans: EntityManager) => {
      created.id = input.id;
      await trans.save(created);

      await new PropertyInsertOperation(trans, Lang2stringEntity).save(created, input);
      await new FlagInsertOperation(trans, Lang2flagEntity).save(created, input);
    });

    return this.langRepo.findOne({
      where: { id: created.id },
      loadRelationIds: true,
    });
  }

  async update(input: LangInput): Promise<LangEntity> {
    await this.manager.transaction(async (trans: EntityManager) => {
      const beforeItem = await this.langRepo.findOne({
        where: { id: input.id },
        relations: {
          string: { property: true },
          flag: { flag: true },
        },
      });
      await beforeItem.save();

      await new PropertyUpdateOperation(trans, Lang2stringEntity).save(beforeItem, input);
      await new FlagUpdateOperation(trans, Lang2flagEntity).save(beforeItem, input);
    });

    return this.langRepo.findOne({
      where: { id: input.id },
      loadRelationIds: true,
    });
  }

  async delete(id: string[]): Promise<string[]> {
    const result = [];
    const list = await this.langRepo.find({ where: { id: In(id) } });

    for (const item of list) {
      await this.langRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }


}
