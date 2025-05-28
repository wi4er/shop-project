import { EntityManager } from 'typeorm';
import { CommonStringEntity } from '../model/common-string.entity';
import { LangEntity } from '../../settings/model/lang.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { WithStringEntity } from '../model/with-string.entity';
import { AttributeStringInput } from '../input/attribute-string.input';

export class StringValueInsertOperation<T extends WithStringEntity<T>> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonStringEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkAttribute(id: string): Promise<AttributeEntity> {
    return WrongDataException.assert(
      await this.trans
        .getRepository(AttributeEntity)
        .findOne({where: {id}}),
      `Attribute with id >> ${id} << not found`,
    );
  }

  /**
   *
   */
  private async checkLang(id?: string): Promise<LangEntity> {
    if (!id) return null;

    return WrongDataException.assert(
      await this.trans
        .getRepository(LangEntity)
        .findOne({where: {id}}),
      `Language with id >> ${id} << not found`,
    );
  }

  /**
   *
   */
  async save(created: T, list: AttributeStringInput[]): Promise<undefined> {
    for (const item of list ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.attribute = await this.checkAttribute(item.attribute);
      inst.string = item.string;
      inst.lang = await this.checkLang(item.lang);

      await this.trans.save(inst);
    }
  }

}