import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index,
  OneToMany, PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { ElementEntity } from '../element/element.entity';
import { SectionEntity } from '../section/section.entity';
import { Block4stringEntity } from './block4string.entity';
import { Block2flagEntity } from './block2flag.entity';
import { Block2permissionEntity } from './block2permission.entity';
import { WithFlagEntity } from '../../../common/model/with-flag.entity';
import { WithStringEntity } from '../../../common/model/with-string.entity';
import { Block4pointEntity } from './block4point.entity';
import { WithPointEntity } from '../../../common/model/with-point.entity';
import { Block4fileEntity } from './block4file.entity';
import { Block4descriptionEntity } from './block4description.entity';

@Entity('content-block')
@Index(['sort'])
export class BlockEntity
  extends BaseEntity
  implements WithFlagEntity<BlockEntity>,
    WithStringEntity<BlockEntity>,
    WithPointEntity<BlockEntity> {

  @PrimaryColumn({
    type: 'varchar',
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @Column()
  sort: number = 100;

  @OneToMany(
    type => Block2permissionEntity,
    permission => permission.parent,
  )
  permission: Block2permissionEntity[];

  @OneToMany(
    type => ElementEntity,
    element => element.block,
  )
  element: ElementEntity;

  @OneToMany(
    type => SectionEntity,
    section => section.block,
  )
  section: SectionEntity;

  @OneToMany(
    type => Block4stringEntity,
    attribute => attribute.parent,
  )
  string: Block4stringEntity[];

  @OneToMany(
    type => Block4descriptionEntity,
    attribute => attribute.parent,
  )
  description: Block4descriptionEntity[];

  @OneToMany(
    type => Block4pointEntity,
    attribute => attribute.parent,
  )
  point: Block4pointEntity[];

  @OneToMany(
    type => Block4fileEntity,
    attribute => attribute.parent,
  )
  file: Block4fileEntity[];

  @OneToMany(
    type => Block2flagEntity,
    flag => flag.parent,
  )
  flag: Block2flagEntity[];

}