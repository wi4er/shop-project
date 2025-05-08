import { BaseEntity } from 'typeorm';
import { FlagEntity } from '../../settings/model/flag.entity';

export interface CommonFlagEntity<T extends BaseEntity>
  extends BaseEntity {

  parent: T;

  flag: FlagEntity;

}