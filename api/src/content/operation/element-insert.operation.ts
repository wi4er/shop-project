import { EntityManager } from 'typeorm';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { ElementEntity } from '../model/element.entity';
import { Element4stringEntity } from '../model/element4string.entity';
import { Element2flagEntity } from '../model/element2flag.entity';
import { ElementInput } from '../input/element.input';
import { BlockEntity } from '../model/block.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { PointValueInsertOperation } from '../../common/operation/point-value-insert.operation';
import { Element4pointEntity } from '../model/element4point.entity';
import { filterProperties } from '../../common/input/filter-properties';
import { PermissionValueInsertOperation } from '../../common/operation/permission-value-insert.operation';
import { ElementPermissionEntity } from '../model/element-permission.entity';

export class ElementInsertOperation {

  created: ElementEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new ElementEntity();
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkBlock(id: number): Promise<BlockEntity> {
    const blockRepo = this.manager.getRepository<BlockEntity>(BlockEntity);
    const inst = await blockRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, 'Wrong block id!');
  }

  /**
   *
   * @param input
   */
  async save(input: ElementInput): Promise<number> {
    this.created.block = await this.checkBlock(input.block);

    await this.manager.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, Element4stringEntity).save(this.created, stringList);
    await new PointValueInsertOperation(this.manager, Element4pointEntity).save(this.created, pointList);
    await new FlagValueInsertOperation(this.manager, Element2flagEntity).save(this.created, input);
    await new PermissionValueInsertOperation(this.manager, ElementPermissionEntity).save(this.created, input);

    return this.created.id;
  }

}