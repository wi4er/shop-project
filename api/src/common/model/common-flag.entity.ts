import { BaseEntity } from 'typeorm';
import { FlagEntity } from '../../settings/model/flag.entity';

export class CommonFlagEntity<T extends BaseEntity> {

  id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  version: number;
  parent: T;
  flag: FlagEntity;

}