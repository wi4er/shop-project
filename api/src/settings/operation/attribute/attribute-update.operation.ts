import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { AttributeInput } from '../../input/attribute.input';
import { AttributeEntity, AttributeType } from '../../model/attribute.entity';
import { Attribute4stringEntity } from '../../model/attribute4string.entity';
import { Attribute2flagEntity } from '../../model/attribute2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeAsPointUpdateOperation } from './attribute-as-point-update.operation';
import { AttributeAsElementUpdateOperation } from './attribute-as-element-update.operation';
import { AttributeAsSectionUpdateOperation } from './attribute-as-section-update.operation';
import { AttributeAsFileUpadteOperation } from './attribute-as-file-upadte.operation';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/string-value.operation';

export class AttributeUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkAttribute(id: string): Promise<AttributeEntity> {
    return NoDataException.assert(
      await this.transaction
        .getRepository(AttributeEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true},
            flag: {flag: true},
          },
        }),
      `Attribute with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: AttributeInput): Promise<string> {
    try {
      await this.transaction.update(AttributeEntity, {id}, {
        id: WrongDataException.assert(input.id, 'AttributeEntity id expected'),
        type: WrongDataException.assert(
          AttributeType[input.type ?? AttributeType.STRING],
          `Wrong attribute type >> ${input.type} <<, expected [${Object.keys(AttributeType).join(', ')}]`,
        ),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkAttribute(input.id);

    await new AttributeAsPointUpdateOperation(this.transaction).save(beforeItem, input);
    await new AttributeAsElementUpdateOperation(this.transaction).save(beforeItem, input);
    await new AttributeAsSectionUpdateOperation(this.transaction).save(beforeItem, input);
    await new AttributeAsFileUpadteOperation(this.transaction).save(beforeItem, input);

    await new FlagValueOperation(this.transaction, Attribute2flagEntity).save(beforeItem, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, Attribute4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}