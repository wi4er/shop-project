import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { WithImageEntity } from '../../model/with/with-image.entity';
import { FileEntity } from '../../../storage/model/file.entity';
import { CommonImageEntity } from '../../model/common/common-image.entity';

export class ImageInsertOperation<T extends WithImageEntity<T>>{

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonImageEntity<T>,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkFile(id?: number): Promise<FileEntity> {
    WrongDataException.assert(id, 'File id expected');
    const fileRepo = this.trans.getRepository(FileEntity);

    return WrongDataException.assert(
      await fileRepo.findOne({where: {id}}),
      `File  with id ${id} not found!`
    );
  }

  /**
   *
   * @param created
   * @param list
   */
  async save(created: T, list: Array<number>) {
    for (const item of list ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.image = await this.checkFile(item);

      await this.trans.save(inst);
    }
  }

}