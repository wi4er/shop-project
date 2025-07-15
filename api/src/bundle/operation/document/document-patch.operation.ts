import { EntityManager } from 'typeorm';
import { DocumentEntity } from '../../model/document/document.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { DocumentInput } from '../../input/document.input';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { Document2flagEntity } from '../../model/document/document2flag.entity';
import { FieldValueOperation } from '../../../common/operation/field-value.operation';
import { Document2fieldEntity } from '../../model/document/document2field.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { Document4stringEntity } from '../../model/document/document4string.entity';

export class DocumentPatchOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkDocument(id: string): Promise<DocumentEntity> {
    return NoDataException.assert(
      await this.manager
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

    await beforeItem.save();

    if (input.flag) await new FlagValueOperation(this.manager, beforeItem ).save(Document2flagEntity, input.flag);
    if (input.field) await new FieldValueOperation(this.manager, Document2fieldEntity).save(beforeItem, input.field);

    if (input.attribute) {
      const pack = filterAttributes(input.attribute);
      await new StringValueOperation(this.manager, Document4stringEntity).save(beforeItem, pack.string);
    }

    return beforeItem.id;
  }

}