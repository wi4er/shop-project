import { BaseEntity } from 'typeorm';
import { PointEntity } from '../../directory/model/point.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';

export class CommonPointEntity<T extends BaseEntity> {

  id: any;
  point: PointEntity;
  parent: T;
  attribute: AttributeEntity;

}