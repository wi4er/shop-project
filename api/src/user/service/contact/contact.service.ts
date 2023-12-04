import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PropertyValueInsertOperation } from '../../../common/operation/property-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { PropertyValueUpdateOperation } from '../../../common/operation/property-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { UserContactEntity } from '../../model/user-contact.entity';
import { UserContactInput } from '../../input/user-contact.input';
import { UserContact2stringEntity } from '../../model/user-contact2string.entity';
import { UserContact2flagEntity } from '../../model/user-contact2flag.entity';

@Injectable()
export class ContactService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager,
    @InjectRepository(UserContactEntity)
    private contactRepo: Repository<UserContactEntity>,
  ) {
  }

  async insert(input: UserContactInput): Promise<UserContactEntity> {
    const created = new UserContactEntity();

    await this.manager.transaction(async (trans: EntityManager) => {
      created.id = input.id;
      created.type = input.type;
      await trans.save(created);

      await new PropertyValueInsertOperation(trans, UserContact2stringEntity).save(created, input);
      await new FlagValueInsertOperation(trans, UserContact2flagEntity).save(created, input);
    });

    return this.contactRepo.findOne({
      where: {id: created.id},
      loadRelationIds: true,
    });
  }

  async update(input: UserContactInput): Promise<UserContactEntity> {
    await this.manager.transaction(async (trans: EntityManager) => {
      const beforeItem = await this.contactRepo.findOne({
        where: {id: input.id},
        relations: {
          string: {property: true},
          flag: {flag: true},
        },
      });

      beforeItem.type = input.type;
      await beforeItem.save();

      await new PropertyValueUpdateOperation(trans, UserContact2stringEntity).save(beforeItem, input);
      await new FlagValueUpdateOperation(trans, UserContact2flagEntity).save(beforeItem, input);
    });

    return this.contactRepo.findOne({
      where: {id: input.id},
      loadRelationIds: true,
    });
  }

  async delete(id: string[]): Promise<string[]> {
    const result = [];
    const list = await this.contactRepo.find({where: {id: In(id)}});

    for (const item of list) {
      await this.contactRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}
