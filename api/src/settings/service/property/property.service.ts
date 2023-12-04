import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PropertyValueInsertOperation } from '../../../common/operation/property-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { PropertyValueUpdateOperation } from '../../../common/operation/property-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { PropertyEntity } from '../../model/property.entity';
import { Property2stringEntity } from '../../model/property2string.entity';
import { Property2flagEntity } from '../../model/property2flag.entity';
import { PropertyInput } from '../../input/property.input';

@Injectable()
export class PropertyService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager,
    @InjectRepository(PropertyEntity)
    private propertyRepo: Repository<PropertyEntity>,
  ) {
  }

  async insert(input: PropertyInput): Promise<PropertyEntity> {
    const created = new PropertyEntity();

    await this.manager.transaction(async (trans: EntityManager) => {
      created.id = input.id;
      await trans.save(created);

      await new PropertyValueInsertOperation(trans, Property2stringEntity).save(created, input);
      await new FlagValueInsertOperation(trans, Property2flagEntity).save(created, input);
    });

    return this.propertyRepo.findOne({
      where: { id: created.id },
      loadRelationIds: true,
    });
  }

  async update(input: PropertyInput): Promise<PropertyEntity> {
    await this.manager.transaction(async (trans: EntityManager) => {
      const beforeItem = await this.propertyRepo.findOne({
        where: { id: input.id },
        relations: {
          string: { property: true },
          flag: { flag: true },
        },
      });
      await beforeItem.save();

      await new PropertyValueUpdateOperation(trans, Property2stringEntity).save(beforeItem, input);
      await new FlagValueUpdateOperation(trans, Property2flagEntity).save(beforeItem, input);
    });

    return this.propertyRepo.findOne({
      where: { id: input.id },
      loadRelationIds: true,
    });
  }

  async delete(id: string[]): Promise<string[]> {
    const result = [];
    const list = await this.propertyRepo.find({ where: { id: In(id) } });

    for (const item of list) {
      await this.propertyRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}
