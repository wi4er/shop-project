import { EntityManager } from 'typeorm';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { DocumentEntity } from '../model/document.entity';
import { DocumentInput } from '../input/document.input';
import { Document4stringEntity } from '../model/document4string.entity';
import { Document2flagEntity } from '../model/document2flag.entity';
import { filterProperties } from '../../common/input/filter-properties';

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

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, Document4stringEntity).save(this.created, stringList);
    await new FlagValueInsertOperation(this.manager, Document2flagEntity).save(this.created, input);

    return this.created.id;
  }

}