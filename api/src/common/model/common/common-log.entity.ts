import { BaseEntity } from 'typeorm';

export interface CommonLogEntity<T extends BaseEntity>
  extends BaseEntity {

  parent: T;

  version: number;
  value: string;

  from: string;
  to: string;

}