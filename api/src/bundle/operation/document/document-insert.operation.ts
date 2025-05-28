import { EntityManager } from 'typeorm';
import { StringValueInsertOperation } from '../../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { DocumentEntity } from '../../model/document/document.entity';
import { DocumentInput } from '../../input/document.input';
import { Document4stringEntity } from '../../model/document/document4string.entity';
import { Document2flagEntity } from '../../model/document/document2flag.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';

export class DocumentInsertOperation {

  created: DocumentEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new DocumentEntity();
  }

  /**
   *
   * @param input
   */
  async save(input: DocumentInput): Promise<string> {
    await this.manager.save(this.created);

    await new FlagValueInsertOperation(this.manager, Document2flagEntity).save(this.created, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.manager, Document4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}