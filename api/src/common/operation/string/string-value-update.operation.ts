import { BaseEntity, EntityManager } from 'typeorm';
import { CommonStringEntity } from '../../model/common/common-string.entity';
import { WithStringEntity } from '../../model/with/with-string.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { AttributeStringInput } from '../../input/attribute-string.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class StringValueUpdateOperation<T extends WithStringEntity<BaseEntity>> {

  constructor(
    private transaction: EntityManager,
    private entity: new() => CommonStringEntity<T>,
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
  async save(beforeItem: T, list: AttributeStringInput[]) {
    const current: { [key: string]: Array<CommonStringEntity<BaseEntity>> } = {};

    for (const item of beforeItem.string) {
      const {id} = item.attribute;

      if (current[id]) current[id].push(item);
      else current[id] = [item];
    }

    for (const item of list) {
      const inst = current[item.attribute]?.length
        ? current[item.attribute].shift()
        : new this.entity();

      inst.parent = beforeItem;
      inst.attribute = await this.checkAttribute(item.attribute);
      inst.string = WrongDataException.assert(item.string, 'Attribute string value expected!');
      inst.lang = await this.checkLang(item.lang);

      await this.transaction.save(inst);
    }

    for (const item of Object.values(current).flat()) {
      await this.transaction.delete(this.entity, item.id);
    }
  }

}