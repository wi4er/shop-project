import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../../model/directory.entity';
import { PointEntity } from '../../model/point.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { StringValueInsertOperation } from '../../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { PointInput } from '../../input/point.input';
import { Point4stringEntity } from '../../model/point4string.entity';
import { Point2flagEntity } from '../../model/point2flag.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { PointValueInsertOperation } from '../../../common/operation/point-value-insert.operation';
import { Point4pointEntity } from '../../model/point4point.entity';

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

    await new FlagValueInsertOperation(this.transaction, Point2flagEntity).save(this.created, input);

    const [stringList, pointList] = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.transaction, Point4stringEntity).save(this.created, stringList);
    await new PointValueInsertOperation(this.transaction, Point4pointEntity).save(this.created, pointList);

    return this.created.id;
  }

}