import { BaseEntity } from 'typeorm';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';

export interface CommonDescriptionEntity<P extends BaseEntity>
  extends BaseEntity {

  id: number;
  parent: P;

  description: string;
  attribute: AttributeEntity;
  lang?: LangEntity;

}