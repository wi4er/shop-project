import { BaseEntity } from 'typeorm';

export interface CommonLogEntity<T extends BaseEntity>
  extends BaseEntity {

  parent: T;

  field: string;
  operation: string;

  from: string;
  to: string;

}