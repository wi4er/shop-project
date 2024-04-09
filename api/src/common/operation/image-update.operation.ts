import { WithImageEntity } from '../model/with-image.entity';
import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { CommonImageEntity } from '../model/common-image.entity';
import { FileEntity } from '../../storage/model/file.entity';

export class ImageUpdateOperation<T extends WithImageEntity<T>> {

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
   * @param beforeItem
   * @param list
   */
  async save(beforeItem: T, list: Array<number>) {
    const current: Array<number> = beforeItem.image.map(it => it.image.id);

    for (const item of list ?? []) {
      if (current.includes(item)) {
        current.splice(current.indexOf(item), 1);
      } else {
        const inst = new this.entity();
        inst.parent = beforeItem;
        inst.image = await this.checkFile(item);

        await this.trans.save(inst);
      }
    }

    for (const item of current) {
      await this.trans.delete(this.entity, {
        parent: beforeItem,
        image: item,
      });
    }
  }

}