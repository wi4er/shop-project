import { WithImageEntity } from '../model/with/with-image.entity';
import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { CommonImageEntity } from '../model/common/common-image.entity';
import { FileEntity } from '../../storage/model/file.entity';

export class ImageValueOperation<T extends WithImageEntity<T>> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonImageEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkFile(id?: number): Promise<FileEntity> {
    return WrongDataException.assert(
      await this.trans
        .getRepository(FileEntity)
        .findOne({where: {id}}),
      `File with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  async save(beforeItem: T, list: Array<number>) {
    const current: Array<number> = beforeItem.image?.map(it => it.image.id) ?? [];

    for (const item of list ?? []) {
      if (current.includes(item)) {
        current.splice(current.indexOf(item), 1);
      } else {
        const inst = new this.entity();
        inst.parent = beforeItem;
        inst.image = await this.checkFile(
          WrongDataException.assert(item, 'File id expected'),
        );

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