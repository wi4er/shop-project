import { BaseEntity } from 'typeorm';
import { FieldEntity } from '../../../settings/model/field/field.entity';

export interface CommonFieldEntity<T extends BaseEntity>
  extends BaseEntity {

  parent: T;

  field: FieldEntity;

}