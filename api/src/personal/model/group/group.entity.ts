import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, VersionColumn, OneToMany, ManyToOne, PrimaryColumn,
} from 'typeorm';
import { Group4stringEntity } from './group4string.entity';
import { Group2flagEntity } from './group2flag.entity';
import { User2groupEntity } from '../user/user2group.entity';
import { WithFlagEntity } from '../../../common/model/with/with-flag.entity';
import { WithStringEntity } from '../../../common/model/with/with-string.entity';

@Entity('personal-group')
export class GroupEntity
  extends BaseEntity
  implements WithFlagEntity<GroupEntity>, WithStringEntity<GroupEntity> {

  @PrimaryColumn({
    type: "varchar",
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @VersionColumn()
  version: number;

  @ManyToOne(
    type => GroupEntity,
    group => group.children,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  parent: GroupEntity | null;

  @OneToMany(
    type => GroupEntity,
    group => group.parent,
  )
  children: GroupEntity[];

  @OneToMany(
    type => User2groupEntity,
    user => user.group,
  )
  user: User2groupEntity[];

  @OneToMany(
    type => Group4stringEntity,
    property => property.parent,
  )
  string: Group4stringEntity[];

  @OneToMany(
    type => Group2flagEntity,
    flag => flag.parent,
  )
  flag: Group2flagEntity[];

}