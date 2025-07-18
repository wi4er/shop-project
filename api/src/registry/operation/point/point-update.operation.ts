import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { PointInput } from '../../input/point/point.input';
import { DirectoryEntity } from '../../model/directory/directory.entity';
import { PointEntity } from '../../model/point/point.entity';
import { Point4stringEntity } from '../../model/point/point4string.entity';
import { Point2flagEntity } from '../../model/point/point2flag.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { Point4pointEntity } from '../../model/point/point4point.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { PointValueOperation } from '../../../common/operation/attribute/point-value.operation';

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

    await new FlagValueOperation(this.transaction, beforeItem).save(Point2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, beforeItem).save(Point4stringEntity, pack.string);
    await new PointValueOperation(this.transaction, Point4pointEntity).save(beforeItem, pack.point);

    return beforeItem.id;
  }

}