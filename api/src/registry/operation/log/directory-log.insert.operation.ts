import { EntityManager } from 'typeorm';
import { Directory2logEntity } from '../../model/directory/directory2log.entity';
import { DirectoryEntity } from '../../model/directory/directory.entity';

export interface DirectoryLogData {

  from: string;
  to: string;

}

export class DirectoryLogInsertOperation {

  created: Directory2logEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new Directory2logEntity();
  }

  /**
   *
   */
  async save(
    created: DirectoryEntity,
    data: DirectoryLogData,
  ) {

    const inst = new Directory2logEntity();
    inst.parent = created;
    inst.value = 'id';
    inst.version = created.version;
    inst.from = data.from;
    inst.to = data.to;

    await this.transaction.save(inst);
  }

}