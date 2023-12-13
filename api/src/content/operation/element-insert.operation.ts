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
import { Element2permissionEntity } from '../model/element2permission.entity';
import { Element4elementInsertOperation } from './element4element-insert.operation';

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

    return WrongDataException.assert(inst, `Block with id ${id} not found!`);
  }

  /**
   *
   * @param input
   */
  async save(input: ElementInput): Promise<number> {
    this.created.block = await this.checkBlock(input.block);

    await this.manager.save(this.created);

    const [stringList, pointList, elementList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, Element4stringEntity).save(this.created, stringList);
    await new PointValueInsertOperation(this.manager, Element4pointEntity).save(this.created, pointList);
    await new FlagValueInsertOperation(this.manager, Element2flagEntity).save(this.created, input);
    await new Element4elementInsertOperation(this.manager).save(this.created, elementList);
    await new PermissionValueInsertOperation(this.manager, Element2permissionEntity).save(this.created, input);

    return this.created.id;
  }

}