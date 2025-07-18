import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FieldEntity } from './field.entity';
import { FlagEntity } from '../flag/flag.entity';

@Entity('settings-field2flag')
@Index(['parent', 'flag'], {unique: true})
export class Field2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<FieldEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => FieldEntity,
    field => field.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: FieldEntity;

  @ManyToOne(
    type => FlagEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}