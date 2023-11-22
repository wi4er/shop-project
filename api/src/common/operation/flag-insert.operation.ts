import { BaseEntity, EntityManager } from 'typeorm';
import { CommonFlagEntity } from '../model/common-flag.entity';
import { WithFlagInput } from '../input/with-flag.input';
import { FlagEntity } from '../../settings/model/flag.entity';

export class FlagInsertOperation<T extends BaseEntity> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonFlagEntity<T>,
  ) {
  }

  async save(created: T, input: WithFlagInput) {
    const flagRepo = this.trans.getRepository(FlagEntity);

    for (const item of input.flag ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.flag = await flagRepo.findOne({where: {id: item}});

      await this.trans.save(inst);
    }
  }

}