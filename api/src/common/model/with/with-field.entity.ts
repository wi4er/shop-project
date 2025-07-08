import { CommonFieldEntity } from '../common/common-field.entity';
import { BaseEntity } from 'typeorm';

export interface WithFieldEntity<T extends BaseEntity>
  extends BaseEntity {

  field: Array<CommonFieldEntity<T>>

}