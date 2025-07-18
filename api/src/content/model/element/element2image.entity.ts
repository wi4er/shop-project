import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ElementEntity } from './element.entity';
import { FileEntity } from '../../../storage/model/file/file.entity';
import { CommonImageEntity } from '../../../common/model/common/common-image.entity';

@Entity('content-element2image')
@Index(['parent', 'image'], {unique: true})
export class Element2imageEntity
  extends BaseEntity
  implements CommonImageEntity<ElementEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => ElementEntity,
    element => element.image,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: ElementEntity;

  @ManyToOne(
    type => FileEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  image: FileEntity;

}