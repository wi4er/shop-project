import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointEntity } from '../../model/point.entity';

@Controller('point')
export class PointController {

  constructor(
    @InjectRepository(PointEntity)
    private pointRepo: Repository<PointEntity>,
  ) {
  }

  toView(item: PointEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      property: [
        ...item.string.map(str => ({
          string: str.string,
          property: str.property.id,
          lang: str.lang?.id,
        })),
        ...item.point.map(val => ({
          property: val.property.id,
          point: val.point.id,
          directory: val.point.directory.id,
        })),
      ],
      flag: item.flag.map(fl => fl.flag.id),
    };
  }

  @Get()
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.pointRepo.find({
      relations: {
        string: {property: true, lang: true},
        flag: {flag: true},
        point: {point: {directory: true}, property: true},
      },
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.pointRepo.count().then(count => ({count}));
  }

}
