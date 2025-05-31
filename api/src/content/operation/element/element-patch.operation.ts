import { EntityManager } from 'typeorm';
import { ElementEntity } from '../../model/element/element.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { ElementInput } from '../../input/element.input';
import { FlagValueUpdateOperation } from '../../../common/operation/flag/flag-value-update.operation';
import { Element2flagEntity } from '../../model/element/element2flag.entity';
import { PermissionValueUpdateOperation } from '../../../common/operation/permission/permission-value-update.operation';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';

export class ElementPatchOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkElement(id: string): Promise<ElementEntity> {
    return NoDataException.assert(
      await this.manager
        .getRepository(ElementEntity)
        .findOne({
          where: {id},
          relations: {
            image: {image: true},
            string: {attribute: true},
            flag: {flag: true},
            point: {point: true, attribute: true},
            element: {element: true, attribute: true},
            permission: {group: true},
          },
        }),
      `Element with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: ElementInput): Promise<string> {
    const beforeItem = await this.checkElement(id);

    if (input.flag) await new FlagValueUpdateOperation(this.manager, Element2flagEntity).save(beforeItem, input);
    if (input.permission) await new PermissionValueUpdateOperation(this.manager, Element2permissionEntity).save(beforeItem, input);

    return id;
  }

}