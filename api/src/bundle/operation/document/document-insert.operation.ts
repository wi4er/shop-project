import { EntityManager } from 'typeorm';
import { DocumentEntity } from '../../model/document/document.entity';
import { DocumentInput } from '../../input/document.input';
import { Document4stringEntity } from '../../model/document/document4string.entity';
import { Document2flagEntity } from '../../model/document/document2flag.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { FieldValueOperation } from '../../../common/operation/field-value.operation';
import { Document2fieldEntity } from '../../model/document/document2field.entity';

export class DocumentInsertOperation {

  created: DocumentEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new DocumentEntity();
  }

  /**
   *
   */
  async save(input: DocumentInput): Promise<string> {
    await this.transaction.save(this.created);

    await new FlagValueOperation(this.transaction, this.created).save(Document2flagEntity, input.flag);
    await new FieldValueOperation(this.transaction, Document2fieldEntity).save(this.created, input.field);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, this.created).save(Document4stringEntity, pack.string);

    return this.created.id;
  }

}