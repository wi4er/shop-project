import { BaseEntity, EntityManager } from 'typeorm';
import { WithFlagEntity } from '../model/with/with-flag.entity';
import { CommonFlagEntity } from '../model/common/common-flag.entity';
import { FlagEntity } from '../../settings/model/flag/flag.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { CommonLogEntity } from '../model/common/common-log.entity';

export class FlagValueOperation<T extends WithFlagEntity<BaseEntity>> {

  constructor(
    private transaction: EntityManager,
    private beforeItem?: T,
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
      `Flag with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(
    entity: new() => CommonFlagEntity<T>,
    input: string[]
  ) {
    const current: Array<string> = this.beforeItem.flag?.map(it => it.flag.id) ?? [];

    for (const item of input ?? []) {
      if (current.includes(item)) {
        current.splice(current.indexOf(item), 1);
      } else {
        const inst = new entity();
        inst.parent = this.beforeItem;
        inst.flag = await this.checkFlag(item);

        await this.transaction.save(inst)
          .catch(err => {
            throw new WrongDataException(err.detail);
          });
      }
    }

    for (const item of current) {
      await this.transaction
        .delete(entity, {
          parent: this.beforeItem,
          flag: item,
        })
        .catch(err => {
          throw new WrongDataException(err.detail);
        });
    }
  }

  /**
   *
   */
  async log(
    entity: new() => CommonLogEntity<T>,
    input: string[]
  ) {
    const current : Array<string> = this.beforeItem.flag?.map(it => it.flag.id) ?? [];

    for (const item of input ?? []) {
      if (current.includes(item)) {
        current.splice(current.indexOf(item), 1);
      } else {
        const inst = new entity();
        inst.parent = this.beforeItem;
        inst.value = `flag.${item}`
        inst.version = this.beforeItem.version;
        inst.from = null;
        inst.to = item;

        await this.transaction.save(inst)
          .catch(err => {
            throw new WrongDataException(err.detail);
          });
      }
    }

    for (const item of current) {
      const inst = new entity();
      inst.parent = this.beforeItem;
      inst.version = this.beforeItem.version;
      inst.value = `flag.${item}`
      inst.from = item;
      inst.to = null;

      await this.transaction.save(inst)
        .catch(err => {
          throw new WrongDataException(err.detail);
        });
    }
  }
}