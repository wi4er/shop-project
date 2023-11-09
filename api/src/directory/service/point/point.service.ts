import { Injectable } from '@nestjs/common';
import { EntityManager, In, Repository } from 'typeorm';
import { PropertyInsertOperation } from '../../../common/operation/property-insert.operation';
import { FlagInsertOperation } from '../../../common/operation/flag-insert.operation';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { PointEntity } from '../../model/point.entity';
import { Point2stringEntity } from '../../model/point2string.entity';
import { Point2flagEntity } from '../../model/point2flag.entity';
import { DirectoryEntity } from '../../model/directory.entity';
import { PropertyUpdateOperation } from '../../../common/operation/property-update.operation';
import { FlagUpdateOperation } from '../../../common/operation/flag-update.operation';
import { PointInput } from '../../input/point.input';

@Injectable()
export class PointService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager,
    @InjectRepository(PointEntity)
    private valueRepo: Repository<PointEntity>,
    @InjectRepository(DirectoryEntity)
    private directoryRepo: Repository<DirectoryEntity>,
  ) {
  }

  async insert(input: PointInput): Promise<PointEntity> {
    const created = new PointEntity();

    await this.manager.transaction(async (trans: EntityManager) => {
      created.id = input.id;
      created.directory = await this.directoryRepo.findOne({where: {id: input.directory}});
      await trans.save(created);

      await new PropertyInsertOperation(trans, Point2stringEntity).save(created, input);
      await new FlagInsertOperation(trans, Point2flagEntity).save(created, input);
    });

    return this.valueRepo.findOne({
      where: {id: created.id},
      loadRelationIds: true,
    });
  }

  async update(input: PointInput): Promise<PointEntity> {
    await this.manager.transaction(async (trans: EntityManager) => {
      const beforeItem = await this.valueRepo.findOne({
        where: {id: input.id},
        relations: {
          string: {property: true},
          flag: {flag: true},
        },
      });
      beforeItem.directory = await this.directoryRepo.findOne({where: {id: input.directory}});
      await beforeItem.save();

      await new PropertyUpdateOperation(trans, Point2stringEntity).save(beforeItem, input);
      await new FlagUpdateOperation(trans, Point2flagEntity).save(beforeItem, input);
    });

    return this.valueRepo.findOne({
      where: {id: input.id},
      loadRelationIds: true,
    });
  }

  async delete(id: string[]): Promise<string[]> {
    const result = [];
    const list = await this.valueRepo.find({where: {id: In(id)}});

    for (const item of list) {
      await this.valueRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}
