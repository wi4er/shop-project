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
import { filterAttributes } from '../../common/input/filter-attributes';

export class PointUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    const dirRepo = this.manager.getRepository<DirectoryEntity>(DirectoryEntity);

    return WrongDataException.assert(
      await dirRepo.findOne({where: {id}}),
      `Directory with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  private async checkPoint(id: string): Promise<PointEntity> {
    const pointRepo = this.manager.getRepository(PointEntity);

    return NoDataException.assert(
      await pointRepo.findOne({
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
    const beforeItem = await this.checkPoint(id);
    beforeItem.directory = await this.checkDirectory(input.directory);
    beforeItem.id = input.id;

    await beforeItem.save();

    await new FlagValueUpdateOperation(this.manager, Point2flagEntity).save(beforeItem, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.manager, Point4stringEntity).save(beforeItem, stringList);

    return beforeItem.id;
  }

}