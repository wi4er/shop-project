import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { AccessMethod } from './access-method';
import { AccessTarget } from './access-target';
import { GroupEntity } from '../group/group.entity';

@Entity('personal-access')
export class AccessEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @Column({
    type: 'enum',
    enum: AccessTarget,
    nullable: false,
  })
  target: AccessTarget;

  @Column({
    type: 'enum',
    enum: AccessMethod,
    nullable: false,
  })
  method: AccessMethod;

  @ManyToOne(
    type => GroupEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  group: GroupEntity;

}