import { BaseEntity, EntityManager } from 'typeorm';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { LangEntity } from '../../../settings/model/lang.entity';
import { CommonDescriptionEntity } from '../../model/common/common-description.entity';
import { AttributeDescriptionInput } from '../../input/attribute-description.input';
import { WithDescriptionEntity } from '../../model/with/with-description.entity';

export class DescriptionValueUpdateOperation <T extends WithDescriptionEntity<BaseEntity>>{

  constructor(
    private transaction: EntityManager,
    private entity: new() => CommonDescriptionEntity<T>,
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
  async save(beforeItem: T, list: AttributeDescriptionInput[]) {
    const current: { [key: string]: Array<CommonDescriptionEntity<BaseEntity>> } = {};

    for (const item of beforeItem.description) {
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
      inst.description = WrongDataException.assert(item.description, 'Attribute description value expected!');
      inst.lang = await this.checkLang(item.lang);

      await this.transaction.save(inst);
    }

    for (const item of Object.values(current).flat()) {
      await this.transaction.delete(this.entity, item.id);
    }
  }

}