import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../../common/operation/string/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag/flag-value-update.operation';
import { DocumentEntity } from '../../model/document/document.entity';
import { DocumentInput } from '../../input/document.input';
import { Document4stringEntity } from '../../model/document/document4string.entity';
import { Document2flagEntity } from '../../model/document/document2flag.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';

export class DocumentUpdateOperation {

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
            string: {attribute: true},
            flag: {flag: true},
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

    await new FlagValueUpdateOperation(this.manager, Document2flagEntity).save(beforeItem, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.manager, Document4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}