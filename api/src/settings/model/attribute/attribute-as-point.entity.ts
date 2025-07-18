import {
  BaseEntity,
  Entity, Index, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { AttributeEntity } from './attribute.entity';

@Entity('settings-attribute-as-point')
@Index([ 'parent', 'directory'], {unique: true})
export class AttributeAsPointEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => DirectoryEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  directory: DirectoryEntity;

  @OneToOne(
    type => AttributeEntity,
    attr => attr.asPoint,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  parent: AttributeEntity;

}