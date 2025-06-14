import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn, Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { CommonImageEntity } from '../../../common/model/common/common-image.entity';
import { UserEntity } from './user.entity';
import { ElementEntity } from '../../../content/model/element/element.entity';
import { FileEntity } from '../../../storage/model/file/file.entity';

@Entity('personal-user2image')
@Index(['parent', 'image'], {unique: true})
export class User2imageEntity
  extends BaseEntity
  implements CommonImageEntity<UserEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @VersionColumn()
  version: number;

  @ManyToOne(
    () => UserEntity,
    user => user.image,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: UserEntity;

  @ManyToOne(
    type => FileEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  image: FileEntity;

}