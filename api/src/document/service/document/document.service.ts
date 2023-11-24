import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PropertyInsertOperation } from '../../../common/operation/property-insert.operation';
import { FlagInsertOperation } from '../../../common/operation/flag-insert.operation';
import { PropertyUpdateOperation } from '../../../common/operation/property-update.operation';
import { FlagUpdateOperation } from '../../../common/operation/flag-update.operation';
import { DocumentEntity } from '../../model/document.entity';
import { Document2flagEntity } from '../../model/document2flag.entity';
import { Document2stringEntity } from '../../model/document2string.entity';
import { DocumentInput } from '../../input/document.input';

@Injectable()
export class DocumentService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager,
    @InjectRepository(DocumentEntity)
    private docRepo: Repository<DocumentEntity>,
  ) {
  }

  async insert(input: DocumentInput): Promise<DocumentEntity> {
    const created = new DocumentEntity();

    await this.manager.transaction(async (trans: EntityManager) => {
      created.id = input.id;
      await trans.save(created);

      await new PropertyInsertOperation(trans, Document2stringEntity).save(created, input);
      await new FlagInsertOperation(trans, Document2flagEntity).save(created, input);
    });

    return this.docRepo.findOne({
      where: {id: created.id},
      loadRelationIds: true,
    });
  }

  async update(input: DocumentInput): Promise<DocumentEntity> {
    await this.manager.transaction(async (trans: EntityManager) => {
      const beforeItem = await this.docRepo.findOne({
        where: {id: input.id},
        relations: {
          string: {property: true},
          flag: {flag: true},
        },
      });
      await beforeItem.save();

      await new PropertyUpdateOperation(trans, Document2stringEntity).save(beforeItem, input);
      await new FlagUpdateOperation(trans, Document2flagEntity).save(beforeItem, input);
    });

    return this.docRepo.findOne({
      where: {id: input.id},
      loadRelationIds: true,
    });
  }

  async delete(id: string[]): Promise<string[]> {
    const result = [];
    const list = await this.docRepo.find({where: {id: In(id)}});

    for (const item of list) {
      await this.docRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}
