import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../../model/directory.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { PointEntity } from '../../model/point.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { PointInput } from '../../input/point.input';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { Point2flagEntity } from '../../model/point2flag.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { StringValueUpdateOperation } from '../../../common/operation/string-value-update.operation';
import { Point4stringEntity } from '../../model/point4string.entity';

export class PointPatchOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    return WrongDataException.assert(
      await this.transaction
        .getRepository<DirectoryEntity>(DirectoryEntity)
        .findOne({where: {id}}),
      `Directory with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  private async checkPoint(id: string): Promise<PointEntity> {
    return NoDataException.assert(
      await this.transaction
        .getRepository(PointEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true},
            flag: {flag: true},
          },
        }),
      `Point with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: PointInput): Promise<string> {
    try {
      await this.transaction.update(PointEntity, {id}, {
        id: input.id ? WrongDataException.assert(input.id, 'Point id expected!') : undefined,
        directory: input.directory ? await this.checkDirectory(input.directory) : undefined,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkPoint(input.id);

    if (input.flag) await new FlagValueUpdateOperation(this.transaction, Point2flagEntity).save(beforeItem, input);

    const pack = filterAttributes(input.attribute);
    if (input.attribute) await new StringValueUpdateOperation(this.transaction, Point4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}