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
   */
  private async checkProperty(id: string): Promise<PropertyEntity> {
    const propRepo = this.trans.getRepository(PropertyEntity);

    return WrongDataException.assert(
      await propRepo.findOne({where: {id}}),
      `Property with id >> ${id} << not found`
    );
  }

  /**
   *
   */
  private async checkLang(id?: string): Promise<LangEntity> {
    if (!id) return null;

    const langRepo = this.trans.getRepository(LangEntity);

    return WrongDataException.assert(
      await langRepo.findOne({where: {id}}),
      `Language with id >> ${id} << not found`
    );
  }

  /**
   *
   */
  async save(created: T, list: PropertyStringInput[]): Promise<undefined> {
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