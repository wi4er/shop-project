import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { DocumentEntity } from '../model/document.entity';
import { DocumentInput } from '../input/document.input';
import { Document4stringEntity } from '../model/document4string.entity';
import { Document2flagEntity } from '../model/document2flag.entity';
import { filterProperties } from '../../common/input/filter-properties';

export class DocumentUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkBlock(id: number): Promise<DocumentEntity> {
    const docRepo = this.manager.getRepository(DocumentEntity);

    const inst = await docRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, 'Document not found!');

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: number, input: DocumentInput): Promise<number> {
    const beforeItem = await this.checkBlock(id);

    await beforeItem.save();

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, Document4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Document2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}