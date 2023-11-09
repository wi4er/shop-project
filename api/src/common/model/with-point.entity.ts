import { BaseEntity } from 'typeorm';
import { CommonPointEntity } from './common-point.entity';

export abstract class WithPointEntity<T extends BaseEntity> extends BaseEntity {

  point: CommonPointEntity<T>[];

}