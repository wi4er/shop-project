import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { DocumentEntity } from '../../model/document/document.entity';
import { DocumentInput } from '../../input/document.input';
import { Document4stringEntity } from '../../model/document/document4string.entity';
import { Document2flagEntity } from '../../model/document/document2flag.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

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

    await new FlagValueOperation(this.manager, Document2flagEntity).save(beforeItem, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, Document4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}