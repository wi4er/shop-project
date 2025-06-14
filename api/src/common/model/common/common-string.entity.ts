import { BaseEntity } from 'typeorm';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';

export interface CommonStringEntity<P extends BaseEntity>
  extends BaseEntity {

  id: number;
  parent: P;

  string: string;
  attribute: AttributeEntity;
  lang?: LangEntity;

}