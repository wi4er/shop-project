import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity('settings-configuration')
export class ConfigurationEntity
  extends BaseEntity {

  @PrimaryColumn({
    type: "varchar",
    length: 50,
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

  @Column()
  value: string;

}