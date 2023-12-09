import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { PointInput } from '../input/point.input';
import { DirectoryEntity } from '../model/directory.entity';
import { PointEntity } from '../model/point.entity';
import { Point4stringEntity } from '../model/point4string.entity';
import { Point2flagEntity } from '../model/point2flag.entity';
import { filterProperties } from '../../common/input/filter-properties';

export class PointUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    const dirRepo = this.manager.getRepository<DirectoryEntity>(DirectoryEntity);

    const inst = await dirRepo.findOne({where: {id}});
    WrongDataException.assert(inst, 'Wrong directory id!');

    return inst;
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkPoint(id: string): Promise<PointEntity> {
    const pointRepo = this.manager.getRepository(PointEntity);

    const inst = await pointRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, 'Point not found!');

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: PointInput): Promise<string> {
    const beforeItem = await this.checkPoint(id);
    beforeItem.directory = await this.checkDirectory(input.directory);
    beforeItem.id = input.id;

    await beforeItem.save();

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, Point4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Point2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}