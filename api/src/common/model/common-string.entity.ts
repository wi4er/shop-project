import { BaseEntity } from 'typeorm';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { LangEntity } from '../../settings/model/lang.entity';

export interface CommonStringEntity<P extends BaseEntity>
  extends BaseEntity {

  id: number;
  parent: P;

  string: string;
  attribute: AttributeEntity;
  lang?: LangEntity;

}