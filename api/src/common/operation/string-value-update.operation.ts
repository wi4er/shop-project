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
   * @param id
   * @private
   */
  private async checkProperty(id: string): Promise<PropertyEntity> {
    const propRepo = this.trans.getRepository(PropertyEntity);

    const inst = await propRepo.findOne({where: {id}});
    WrongDataException.assert(inst, `Property id ${id} not found!`);

    return inst;
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkLang(id?: string): Promise<LangEntity> {
    if (!id) return null;

    const langRepo = this.trans.getRepository(LangEntity);
    const inst = await langRepo.findOne({where: {id}});

    WrongDataException.assert(inst, `Language id ${id} not found!`);

    return inst;
  }

  async save(beforeItem: T, list: PropertyStringInput[]) {
    const propRepo = this.trans.getRepository(PropertyEntity);
    const langRepo = this.trans.getRepository(LangEntity);
    const current: { [key: string]: Array<CommonStringEntity<BaseEntity>> } = {};

    for (const item of beforeItem.string) {
      if (!current[item.property.id]) {
        current[item.property.id] = [];
      }

      current[item.property.id].push(item);
    }

    for (const item of list ?? []) {
      let inst;

      if (current[item.property]?.[0]) {
        inst = current[item.property].shift();
      } else {
        inst = new this.entity();
      }

      inst.parent = beforeItem;
      inst.property = await this.checkProperty(item.property);
      inst.string = item.string;
      inst.lang = await this.checkLang(item.lang);

      await this.trans.save(inst);
    }

    for (const prop of Object.values(current)) {
      for (const item of prop) {
        await this.trans.delete(this.entity, item.id);
      }
    }
  }

}