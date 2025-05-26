import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { DocumentEntity } from '../model/document.entity';
import { DocumentInput } from '../input/document.input';
import { Document4stringEntity } from '../model/document4string.entity';
import { Document2flagEntity } from '../model/document2flag.entity';
import { filterAttributes } from '../../common/input/filter-attributes';

export class DocumentUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkDocument(id: string): Promise<DocumentEntity> {
    const docRepo = this.manager.getRepository(DocumentEntity);

    return NoDataException.assert(
      await docRepo.findOne({
        where: {id},
        relations: {
          string: {attribute: true},
          flag: {flag: true},
        },
      }),
      `Document with id >>${id}<< not found!`
    );
  }

  /**
   *
   */
  async save(id: string, input: DocumentInput): Promise<string> {
    const beforeItem = await this.checkDocument(id);

    await beforeItem.save();

    await new FlagValueUpdateOperation(this.manager, Document2flagEntity).save(beforeItem, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.manager, Document4stringEntity).save(beforeItem, stringList);

    return beforeItem.id;
  }

}