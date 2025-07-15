import { EntityManager } from 'typeorm';
import { Form2logEntity } from '../../model/form/form2log.entity';
import { FormEntity } from '../../model/form/form.entity';

export interface FormLogData {

  version: number;
  field: string;
  from: string;
  to: string;

}

export class FormLogInsertOperation {

  created: Form2logEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new Form2logEntity();
  }

  /**
   *
   */
  async save(
    created: FormEntity,
    data: FormLogData,
  ) {
    this.created.parent = created;
    this.created.version = created.version;
    this.created.value = 'id';
    this.created.from = data.from;
    this.created.to = data.to;

    await this.transaction.save(this.created);
  }

}