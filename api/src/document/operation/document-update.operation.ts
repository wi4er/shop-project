import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { PropertyValueUpdateOperation } from '../../common/operation/property-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { DocumentEntity } from '../model/document.entity';
import { DocumentInput } from '../input/document.input';
import { Document2stringEntity } from '../model/document2string.entity';
import { Document2flagEntity } from '../model/document2flag.entity';

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

    await new PropertyValueUpdateOperation(this.manager, Document2stringEntity).save(beforeItem, input);
    await new FlagValueUpdateOperation(this.manager, Document2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}