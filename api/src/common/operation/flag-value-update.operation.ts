import { BaseEntity, EntityManager } from 'typeorm';
import { CommonFlagEntity } from '../model/common-flag.entity';
import { WithFlagEntity } from '../model/with-flag.entity';
import { WithFlagInput } from '../input/with-flag.input';
import { FlagEntity } from '../../settings/model/flag.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class FlagValueUpdateOperation<T extends WithFlagEntity<BaseEntity>> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonFlagEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkFlag(id: string): Promise<FlagEntity> {
    const flagRepo = this.trans.getRepository(FlagEntity);

    return WrongDataException.assert(
      await flagRepo.findOne({where: {id}}),
      `Flag with if >> ${id} << not found!`
    );
  }

  /**
   *
   */
  async save(beforeItem: T, input: WithFlagInput) {
    const current: Array<string> = beforeItem.flag.map(it => it.flag.id);

    for (const item of input.flag ?? []) {
      if (current.includes(item)) {
        current.splice(current.indexOf(item), 1);
      } else {
        const inst = new this.entity();
        inst.parent = beforeItem;
        inst.flag = await this.checkFlag(item);

        await this.trans.save(inst)
          .catch(err => {
            throw new WrongDataException(err.detail);
          });
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