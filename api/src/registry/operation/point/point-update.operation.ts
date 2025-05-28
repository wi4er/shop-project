import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { PointInput } from '../../input/point.input';
import { DirectoryEntity } from '../../model/directory.entity';
import { PointEntity } from '../../model/point.entity';
import { Point4stringEntity } from '../../model/point4string.entity';
import { Point2flagEntity } from '../../model/point2flag.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { PointValueUpdateOperation } from '../../../common/operation/point-value-update.operation';
import { Point4pointEntity } from '../../model/point4point.entity';

export class PointUpdateOperation {

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
        id: WrongDataException.assert(input.id, 'Point id expected!'),
        directory: await this.checkDirectory(input.directory),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkPoint(input.id);

    await new FlagValueUpdateOperation(this.transaction, Point2flagEntity).save(beforeItem, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.transaction, Point4stringEntity).save(beforeItem, pack.string);
    await new PointValueUpdateOperation(this.transaction, Point4pointEntity).save(beforeItem, pack.point);

    return beforeItem.id;
  }

}