import { BaseEntity } from 'typeorm';
import { CommonFlagEntity } from '../common/common-flag.entity';

export abstract class WithFlagEntity<T extends BaseEntity>
  extends BaseEntity {

  version: number;

  flag: CommonFlagEntity<T>[];

}