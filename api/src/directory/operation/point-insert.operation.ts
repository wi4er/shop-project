import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../model/directory.entity';
import { PointEntity } from '../model/point.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { PointInput } from '../input/point.input';
import { Point2stringEntity } from '../model/point2string.entity';
import { Point2flagEntity } from '../model/point2flag.entity';
import { filterProperties } from '../../common/input/filter-properties';
import { PointValueInsertOperation } from '../../common/operation/point-value-insert.operation';
import { Point2pointEntity } from '../model/point2point.entity';

export class PointInsertOperation {

  created: PointEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new PointEntity();
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    const dirRepo = this.manager.getRepository<DirectoryEntity>(DirectoryEntity);

    const inst = await dirRepo.findOne({where: {id}});
    WrongDataException.assert(inst, 'Wrong directory id!')

    return inst;
  }

  /**
   *
   * @param input
   */
  async save(input: PointInput): Promise<string> {
    this.created.directory = await this.checkDirectory(input.directory);
    this.created.id = input.id;

    await this.manager.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, Point2stringEntity).save(this.created, stringList);
    await new PointValueInsertOperation(this.manager, Point2pointEntity).save(this.created, pointList);
    await new FlagValueInsertOperation(this.manager, Point2flagEntity).save(this.created, input);

    return this.created.id;
  }

}