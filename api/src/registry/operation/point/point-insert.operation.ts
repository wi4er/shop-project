import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../../model/directory.entity';
import { PointEntity } from '../../model/point.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { PointInput } from '../../input/point.input';
import { Point4stringEntity } from '../../model/point4string.entity';
import { Point2flagEntity } from '../../model/point2flag.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { Point4pointEntity } from '../../model/point4point.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/string-value.operation';
import { PointValueOperation } from '../../../common/operation/point-value.operation';

export class PointInsertOperation {

  created: PointEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new PointEntity();
  }

  /**
   *
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    return WrongDataException.assert(
      await this.transaction
        .getRepository<DirectoryEntity>(DirectoryEntity)
        .findOne({where: {id}}),
      `Directory with id >>${id}<< not found! `,
    );
  }

  /**
   *
   */
  async save(input: PointInput): Promise<string> {
    this.created.id = WrongDataException.assert(input.id, 'Point id expected');
    this.created.directory = await this.checkDirectory(
      WrongDataException.assert(input.directory, 'Directory id expected!'),
    );

    try {
      await this.transaction.insert(PointEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.detail);
    }
    await this.transaction.save(this.created);

    await new FlagValueOperation(this.transaction, Point2flagEntity).save(this.created, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, Point4stringEntity).save(this.created, pack.string);
    await new PointValueOperation(this.transaction, Point4pointEntity).save(this.created, pack.point);

    return this.created.id;
  }

}