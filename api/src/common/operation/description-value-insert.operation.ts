import { EntityManager } from 'typeorm';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { LangEntity } from '../../settings/model/lang.entity';
import { CommonDescriptionEntity } from '../model/common-description.entity';
import { AttributeDescriptionInput } from '../input/attribute-description.input';
import { WithDescriptionEntity } from '../model/with-description.entity';

export class DescriptionValueInsertOperation<T extends WithDescriptionEntity<T>> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonDescriptionEntity<T>,
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
  async save(created: T, list: AttributeDescriptionInput[]): Promise<undefined> {
    for (const item of list ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.attribute = await this.checkAttribute(item.attribute);
      inst.description = item.description;
      inst.lang = await this.checkLang(item.lang);

      await this.trans.save(inst);
    }
  }

}