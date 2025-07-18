import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonImageEntity } from '../../../common/model/common/common-image.entity';
import { UserEntity } from './user.entity';
import { FileEntity } from '../../../storage/model/file/file.entity';

@Entity('personal-user2image')
@Index(['parent', 'image'], {unique: true})
export class User2imageEntity
  extends BaseEntity
  implements CommonImageEntity<UserEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => UserEntity,
    user => user.image,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: UserEntity;

  @ManyToOne(
    type => FileEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  image: FileEntity;

}