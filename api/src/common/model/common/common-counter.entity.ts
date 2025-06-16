import { BaseEntity } from 'typeorm';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

export interface CommonCounterEntity<T extends BaseEntity>
  extends BaseEntity{

  id: number;
  parent: T;

  point: PointEntity;
  attribute: AttributeEntity;
  count: number;

}