import { BaseEntity, EntityManager } from 'typeorm';
import { CommonStringEntity } from '../model/common-string.entity';
import { WithStringEntity } from '../model/with-string.entity';
import { PropertyEntity } from '../../settings/model/property.entity';
import { LangEntity } from '../../settings/model/lang.entity';
import { PropertyStringInput } from '../input/property-string.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class StringValueUpdateOperation<T extends WithStringEntity<BaseEntity>> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonStringEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkProperty(id: string): Promise<PropertyEntity> {
    return WrongDataException.assert(
      await this.trans.getRepository(PropertyEntity).findOne({where: {id}}),
      `Property with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  private async checkLang(id?: string): Promise<LangEntity> {
    if (!id) return null;

    return WrongDataException.assert(
      await this.trans.getRepository(LangEntity).findOne({where: {id}}),
      `Language with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(beforeItem: T, list: PropertyStringInput[]) {
    const current: { [key: string]: Array<CommonStringEntity<BaseEntity>> } = {};

    for (const item of beforeItem.string) {
      const {id} = item.property;

      if (current[id]) current[id].push(item);
      else current[id] = [item];
    }

    for (const item of list) {
      const inst = current[item.property]?.length
        ? current[item.property].shift()
        : new this.entity();

      inst.parent = beforeItem;
      inst.property = await this.checkProperty(item.property);
      inst.string = WrongDataException.assert(item.string, 'Property string value expected');
      inst.lang = await this.checkLang(item.lang);

      await this.trans.save(inst);
    }

    for (const item of Object.values(current).flat()) {
      await this.trans.delete(this.entity, item.id);
    }
  }

}