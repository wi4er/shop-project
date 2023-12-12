import { BaseEntity } from 'typeorm';
import { PointEntity } from '../../directory/model/point.entity';
import { PropertyEntity } from '../../settings/model/property.entity';

export class CommonPointEntity<T extends BaseEntity> {

  id: any;
  point: PointEntity;
  parent: T;
  property: PropertyEntity;

}