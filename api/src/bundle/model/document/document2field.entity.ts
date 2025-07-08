import { BaseEntity, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DocumentEntity } from './document.entity';
import { FieldEntity } from '../../../settings/model/field/field.entity';
import { CommonFieldEntity } from '../../../common/model/common/common-field.entity';

@Entity('bundle-document2field')
@Index(['parent', 'field'], {unique: true})
export class Document2fieldEntity
  extends BaseEntity
  implements CommonFieldEntity<DocumentEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => DocumentEntity,
    document => document.field,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: DocumentEntity;

  @ManyToOne(
    type => FieldEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  field: FieldEntity;

}