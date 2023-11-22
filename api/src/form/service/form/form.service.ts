import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PropertyInsertOperation } from '../../../common/operation/property-insert.operation';
import { FlagInsertOperation } from '../../../common/operation/flag-insert.operation';
import { PropertyUpdateOperation } from '../../../common/operation/property-update.operation';
import { FlagUpdateOperation } from '../../../common/operation/flag-update.operation';
import { FormEntity } from '../../model/form.entity';
import { FormInput } from '../../input/form.input';
import { Form2stringEntity } from '../../model/form2string.entity';
import { Form2flagEntity } from '../../model/form2flag.entity';
import { FlagInput } from '../../../settings/input/flag.input';
import { FlagEntity } from '../../../settings/model/flag.entity';

@Injectable()
export class FormService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager,
    @InjectRepository(FormEntity)
    private formRepo: Repository<FormEntity>,
  ) {
  }

  async insert(input: FormInput): Promise<FormEntity> {
    const created = new FormEntity();

    await this.manager.transaction(async (trans: EntityManager) => {
      created.id = input.id;
      await trans.save(created);

      await new PropertyInsertOperation(trans, Form2stringEntity).save(created, input);
      await new FlagInsertOperation(trans, Form2flagEntity).save(created, input);
    });

    return this.formRepo.findOne({
      where: { id: created.id },
      loadRelationIds: true,
    });
  }

  async update(input: FlagInput): Promise<FlagEntity> {
    await this.manager.transaction(async (trans: EntityManager) => {
      const beforeItem = await this.formRepo.findOne({
        where: { id: input.id },
        relations: {
          string: { property: true },
          flag: { flag: true },
        },
      });
      await beforeItem.save();

      await new PropertyUpdateOperation(trans, Form2stringEntity).save(beforeItem, input);
      await new FlagUpdateOperation(trans, Form2flagEntity).save(beforeItem, input);
    });

    return this.formRepo.findOne({
      where: { id: input.id },
      loadRelationIds: true,
    });
  }

  async delete(id: string[]): Promise<string[]> {
    const result = [];
    const list = await this.formRepo.find({ where: { id: In(id) } });

    for (const item of list) {
      await this.formRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}
