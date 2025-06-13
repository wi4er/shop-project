import { BaseEntity, EntityManager } from 'typeorm';
import { WithFlagEntity } from '../model/with/with-flag.entity';
import { CommonFlagEntity } from '../model/common/common-flag.entity';
import { FlagEntity } from '../../settings/model/flag.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { WithFlagInput } from '../input/with-flag.input';

export class FlagValueOperation<T extends WithFlagEntity<BaseEntity>> {

  constructor(
    private transaction: EntityManager,
    private entity: new() => CommonFlagEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkFlag(id: string): Promise<FlagEntity> {
    return WrongDataException.assert(
      await this.transaction
        .getRepository(FlagEntity)
        .findOne({where: {id}}),
      `Flag with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  async save(beforeItem: T, input: string[]){

    const current: Array<string> = beforeItem.flag?.map(it => it.flag.id) ?? [];

    for (const item of input ?? []) {
      if (current.includes(item)) {
        current.splice(current.indexOf(item), 1);
      } else {
        const inst = new this.entity();
        inst.parent = beforeItem;
        inst.flag = await this.checkFlag(item);

        await this.transaction.save(inst)
          .catch(err => {
            throw new WrongDataException(err.detail);
          });
      }
    }

    for (const item of current) {
      await this.transaction
        .delete(this.entity, {
          parent: beforeItem,
          flag: item,
        })
        .catch(err => {
          throw new WrongDataException(err.detail);
        });
    }
  }

}