import { Controller, Get, Param, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Form2logEntity } from '../../model/form/form2log.entity';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { LogView } from '../../../common/view/log.view';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

interface FormLogOrder {

}

@Controller('feedback/form-log')
export class FormLogController {

  relations = {
    parent: true,
  } as FindOptionsRelations<Form2logEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(Form2logEntity)
    private logRepo: Repository<Form2logEntity>,
  ) {
  }

  /**
   *
   */
  addOrder(
    sort: FormLogOrder[],
    query: SelectQueryBuilder<Form2logEntity>,
  ) {
    if (!Array.isArray(sort)) sort = [sort];

    for (const item of sort) {
      for (const key in item) {
        if (key === 'version') {
          query.addOrderBy('version', item[key].toUpperCase());
        }
      }
    }
  }

  @Get(':formId')
  async getList(
    @Param('formId')
    formId: string,
    @Query('limit')
    limit: number,
    @Query('offset')
    offset: number,
    @Query('sort')
    sort?: FormLogOrder[],
  ) {
    const query = this.logRepo.createQueryBuilder('form')
      .select('form.version', 'version')
      .addSelect('COUNT(form.id)', 'count')
      .where('form.parentId = :formId', {formId})
      .groupBy('form.version');

    if (sort) {
      this.addOrder(sort, query);
    } else {
      query.addOrderBy('version', 'ASC');
    }

    const list = await query.take(limit)
      .skip(offset)
      .getRawMany();

    const logList = await this.logRepo.find({
      relations: this.relations,
      where: {
        parent: {id: formId},
        version: In(list.map(it => it.version))
      },
      order: {version: sort?.['version'] ?? 'ASC'},
    }).then(list => {
      return list.reduce((acc, item) => {
        if (!acc.get(item.version)) acc.set(item.version, []);
        acc.get(item.version).push(item);
        return acc;
      }, new Map() as Map<number, Array<Form2logEntity>>);
    });

    return Array.from(logList.values()).map(value => new LogView(value));
  }

  @Get(':formId/count')
  async getCount(
    @Param('formId')
    formId: string,
  ) {
    const query = await this.logRepo.createQueryBuilder('form')
      .select('form.version', 'version')
      .addSelect('COUNT(form.id)', 'count')
      .where('form.parentId = :formId', {formId})
      .groupBy('form.version')
      .getRawMany();

    return {count: query.length};
  }

}
