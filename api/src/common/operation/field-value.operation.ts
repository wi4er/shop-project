import { WithFieldEntity } from '../model/with/with-field.entity';
import { BaseEntity, EntityManager } from 'typeorm';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { FieldEntity } from '../../settings/model/field/field.entity';
import { CommonFieldEntity } from '../model/common/common-field.entity';

export class FieldValueOperation<T extends WithFieldEntity<BaseEntity>> {

  constructor(
    private transaction: EntityManager,
    private entity: new() => CommonFieldEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkField(id: string): Promise<FieldEntity> {
    return WrongDataException.assert(
      await this.transaction
        .getRepository(FieldEntity)
        .findOne({where: {id}}),
      `Field with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  async save(beforeItem: T, input: string[]) {
    const current: Array<string> = beforeItem.field?.map(it => it.field.id) ?? [];

    for (const item of input ?? []) {
      if (current.includes(item)) {
        current.splice(current.indexOf(item), 1);
      } else {
        const inst = new this.entity();
        inst.parent = beforeItem;
        inst.field = await this.checkField(item);

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
          field: item,
        })
        .catch(err => {
          throw new WrongDataException(err.detail);
        });
    }
  }

}