import { EntityManager } from 'typeorm';
import { PropertyValueInsertOperation } from '../../common/operation/property-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { DocumentEntity } from '../model/document.entity';
import { DocumentInput } from '../input/document.input';
import { Document2stringEntity } from '../model/document2string.entity';
import { Document2flagEntity } from '../model/document2flag.entity';

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
  async save(input: DocumentInput): Promise<number> {
    await this.manager.save(this.created);

    await new PropertyValueInsertOperation(this.manager, Document2stringEntity).save(this.created, input);
    await new FlagValueInsertOperation(this.manager, Document2flagEntity).save(this.created, input);

    return this.created.id;
  }

}