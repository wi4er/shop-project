import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { DocumentEntity } from '../document/document.entity';

@Entity('bundle-instance')
export class InstanceEntity
  extends BaseEntity {

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
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @ManyToOne(
    type => DocumentEntity,
    document => document.instance
  )
  document: DocumentEntity;

}