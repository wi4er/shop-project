import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../common/input/filter-attributes';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { AttributeInput } from '../input/attribute.input';
import { AttributeEntity } from '../model/attribute.entity';
import { Attribute4stringEntity } from '../model/attribute4string.entity';
import { Attribute2flagEntity } from '../model/attribute2flag.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class AttributeUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkProperty(id: string): Promise<AttributeEntity> {
    const propRepo = this.manager.getRepository(AttributeEntity);

    return NoDataException.assert(
      await propRepo.findOne({
        where: {id},
        relations: {
          string: {attribute: true},
          flag: {flag: true},
        },
      }),
      `Property with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  async save(id: string, input: AttributeInput): Promise<string> {
    try {
      await this.manager.update(AttributeEntity, {id}, {
        id:  WrongDataException.assert(input.id, 'Property id expected'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkProperty(input.id);

    await new FlagValueUpdateOperation(this.manager, Attribute2flagEntity).save(beforeItem, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.manager, Attribute4stringEntity).save(beforeItem, stringList);

    return beforeItem.id;
  }

}