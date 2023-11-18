import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionEntity } from '../../model/section.entity';
import { SectionFilterInput } from '../../input/section-filter.input';

@Controller('section')
export class SectionController {

  constructor(
    @InjectRepository(SectionEntity)
    private sectionRepo: Repository<SectionEntity>,
  ) {
  }

  toView(item: SectionEntity) {
    return {
      id: item.id,
      block: item.block.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      parent: item.parent?.id,
      property: [
        ...item.string.map(str => ({
          string: str.string,
          property: str.property.id,
          lang: str.lang,
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
    @Query('filter')
      filter?: SectionFilterInput,
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    const where = {};

    if (filter?.flag) {
      where['flag'] = {flag: {id: filter.flag.eq}};
    }

    return this.sectionRepo.find({
      where,
      relations: {
        parent: true,
        string: {property: true},
        block: true,
        flag: {flag: true},
        point: {point: {directory: true}, property: true},
      },
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

}
