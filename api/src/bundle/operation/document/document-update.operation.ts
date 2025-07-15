import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { DocumentEntity } from '../../model/document/document.entity';
import { DocumentInput } from '../../input/document.input';
import { Document4stringEntity } from '../../model/document/document4string.entity';
import { Document2flagEntity } from '../../model/document/document2flag.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { FieldValueOperation } from '../../../common/operation/field-value.operation';
import { Document2fieldEntity } from '../../model/document/document2field.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class DocumentUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkDocument(id: string): Promise<DocumentEntity> {
    return NoDataException.assert(
      await this.transaction
        .getRepository(DocumentEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true, lang: true},
            flag: {flag: true},
            field: {field: true},
          },
        }),
      `Document with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: DocumentInput): Promise<string> {
    const beforeItem = await this.checkDocument(id);

    try {
      await this.transaction.update(DocumentEntity, {id}, {
        id: WrongDataException.assert(input.id, 'Document id expected'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    await new FlagValueOperation(this.transaction, beforeItem).save(Document2flagEntity, input.flag);
    await new FieldValueOperation(this.transaction, Document2fieldEntity).save(beforeItem, input.field);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, Document4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}