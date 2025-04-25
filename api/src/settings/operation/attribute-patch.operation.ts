import { EntityManager } from 'typeorm';
import { AttributeEntity } from '../model/attribute.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { AttributeInput } from '../input/attribute.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { Attribute2flagEntity } from '../model/attribute2flag.entity';
import { filterAttributes } from '../../common/input/filter-attributes';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { Attribute4stringEntity } from '../model/attribute4string.entity';

export class AttributePatchOperation {

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
      `Property with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: AttributeInput): Promise<string> {
    const beforeItem = await this.checkProperty(id);

    if (input.flag) await new FlagValueUpdateOperation(this.manager, Attribute2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}