import { BaseEntity, Column } from 'typeorm';
import { AttributeEntity } from '../../../settings/model/attribute.entity';

export interface CommonIntervalEntity<P extends BaseEntity>
  extends BaseEntity {

  id: number;
  parent: P;

  from: Date;
  to: Date | null;
  attribute: AttributeEntity;

}