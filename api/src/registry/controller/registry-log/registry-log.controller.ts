import { Controller, Get, Query } from '@nestjs/common';
import { CurrentGroups } from '../../../personal/decorator/current-groups/current-groups.decorator';
import { Repository } from 'typeorm';
import { Directory2logEntity } from '../../model/directory/directory2log.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { InjectRepository } from '@nestjs/typeorm';


export interface RegistryLogFilterInput {

  directory: string;

}

@Controller('registry/log')
export class RegistryLogController {

  constructor(
    @InjectRepository(Directory2logEntity)
    private directoryLogRepo: Repository<Directory2logEntity>,
  ) {
  }

  /**
   *
   */
  toView(item: Directory2logEntity) {
    return {
      id: item.id,
      createdAt: item.created_at.toISOString(),
      directory: item.parent.id,
      field: item.value,
      from: item.from,
      to: item.to,
    };
  }

  /**
   *
   */
  toWhere(filter: RegistryLogFilterInput): FindOptionsWhere<Directory2logEntity> {
    const where: FindOptionsWhere<Directory2logEntity> = {};

    // if (filter.directory) {
    //   where.parent = {id: filter.directory};
    // }

    return where;
  }

  @Get('directory')
  getDirectoryList(
    @Query('directory')
      directory: string,
    @CurrentGroups()
      group: string[],
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.directoryLogRepo.find({
      where: {
        // ...this.toWhere(filter),
        parent: {id: directory},
      },
      relations: {
        parent: true,
      },
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('directory/count')
  getDirectoryCount(
    @Query('directory')
      directory: string,
    @CurrentGroups()
      group: string[],
  ) {
    return this.directoryLogRepo.count({
      where: {
        // ...this.toWhere(filter),
        parent: {id: directory},
      },
      relations: {
        parent: true,
      },
    }).then(count => ({count}));
  }

}
