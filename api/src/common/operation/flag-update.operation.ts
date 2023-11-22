import { BaseEntity, EntityManager } from 'typeorm';
import { CommonFlagEntity } from '../model/common-flag.entity';
import { WithFlagEntity } from '../model/with-flag.entity';
import { WithFlagInput } from '../input/with-flag.input';
import { FlagEntity } from '../../settings/model/flag.entity';

export class FlagUpdateOperation<T extends WithFlagEntity<BaseEntity>> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonFlagEntity<T>,
  ) {
  }

  async save(beforeItem: T, input: WithFlagInput) {
    const flagRepo = this.trans.getRepository(FlagEntity);

    const current: Array<string> = beforeItem.flag.map(it => it.flag.id);

    for (const item of input.flag ?? []) {
      if (current.includes(item)) {
        current.splice(current.indexOf(item), 1);
      } else {
        const inst = new this.entity();
        inst.parent = beforeItem;
        inst.flag = await flagRepo.findOne({ where: { id: item } });

        await this.trans.save(inst);
      }
    }

    for (const item of current) {
      await this.trans.delete(this.entity, {
        parent: beforeItem,
        flag: item,
      });
    }
  }

}