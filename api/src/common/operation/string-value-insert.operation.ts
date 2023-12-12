import { EntityManager } from 'typeorm';
import { CommonStringEntity } from '../model/common-string.entity';
import { LangEntity } from '../../settings/model/lang.entity';
import { PropertyEntity } from '../../settings/model/property.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { WithStringEntity } from '../model/with-string.entity';
import { PropertyStringInput } from '../input/property-string.input';

export class StringValueInsertOperation<T extends WithStringEntity<T>> {

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

    return WrongDataException.assert(inst, `Wrong property ${id}`);
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

    WrongDataException.assert(inst, `Wrong language ${id}`);

    return inst;
  }

  /**
   *
   * @param created
   * @param list
   */
  async save(created: T, list: PropertyStringInput[]) {
    for (const item of list ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.property = await this.checkProperty(item.property);
      inst.string = item.string;
      inst.lang = await this.checkLang(item.lang);

      await this.trans.save(inst);
    }
  }

}