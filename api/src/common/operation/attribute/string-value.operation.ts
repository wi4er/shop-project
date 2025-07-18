import { BaseEntity, EntityManager } from 'typeorm';
import { CommonStringEntity } from '../../model/common/common-string.entity';
import { WithStringEntity } from '../../model/with/with-string.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { AttributeStringInput } from '../../input/attribute/attribute-string.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { CommonLogEntity } from '../../model/common/common-log.entity';

export class StringValueOperation<T extends WithStringEntity<T>> {

  constructor(
    private transaction: EntityManager,
    private beforeItem?: T,
  ) {
  }

  /**
   *
   */
  private async checkAttribute(id: string): Promise<AttributeEntity> {
    return WrongDataException.assert(
      await this.transaction
        .getRepository(AttributeEntity)
        .findOne({where: {id}}),
      `Attribute with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  private async checkLang(id?: string): Promise<LangEntity> {
    if (!id) return null;

    return WrongDataException.assert(
      await this.transaction
        .getRepository(LangEntity)
        .findOne({where: {id}}),
      `Language with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(
    entity: new() => CommonStringEntity<T>,
    input: AttributeStringInput[],
  ) {
    const current: { [key: string]: Array<CommonStringEntity<BaseEntity>> } = {};

    for (const item of this.beforeItem.string ?? []) {
      const {id} = item.attribute;

      if (current[id]) current[id].push(item);
      else current[id] = [item];
    }

    for (const item of input) {
      const inst = current[item.attribute]?.length
        ? await this.transaction.getRepository(entity).findOne({where: {id: current[item.attribute].shift().id}})
        : new entity();

      inst.parent = this.beforeItem;
      inst.attribute = await this.checkAttribute(
        WrongDataException.assert(item.attribute, 'Attribute id expected'),
      );
      inst.string = WrongDataException.assert(item.string, 'String value expected!');
      inst.lang = await this.checkLang(item.lang);

      await this.transaction.save(inst);
    }

    for (const item of Object.values(current).flat()) {
      await this.transaction.delete(entity, item.id);
    }
  }

  /**
   *
   */
  async log(
    entity: new() => CommonLogEntity<T>,
    input: AttributeStringInput[],
  ) {
    const current: { [key: string]: Array<CommonStringEntity<BaseEntity>> } = {};

    // console.log(this.beforeItem);

    for (const item of this.beforeItem.string ?? []) {
      const {id} = item.attribute;

      if (current[id]) current[id].push(item);
      else current[id] = [item];
    }

    for (const item of input) {
      if (current[item.attribute]?.length) {
        const stringItem = current[item.attribute].shift();

        if (item.string !== stringItem.string) {
          const inst = new entity();
          inst.parent = this.beforeItem;
          inst.value = `attribute.${item.attribute}`;
          inst.version = this.beforeItem.version;
          inst.from = stringItem.string;
          inst.to = item.string;

          await this.transaction.save(inst);
        }
      } else {
        const inst = new entity();
        inst.parent = this.beforeItem;
        inst.value = `attribute.${item.attribute}`;
        inst.version = this.beforeItem.version;
        inst.from = null;
        inst.to = item.string;

        await this.transaction.save(inst);
      }
    }

    for (const item of Object.values(current).flat()) {
      const inst = new entity();
      inst.parent = this.beforeItem;
      inst.value = `attribute.${item.attribute.id}`;
      inst.version = this.beforeItem.version;
      inst.from = item.string;
      inst.to = null;

      await this.transaction.save(inst);
    }
  }

}