import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionEntity } from '../../model/section.entity';
import { SectionFilterInput } from '../../input/section-filter.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { SectionService } from '../../service/section/section.service';
import { SectionInput } from '../../input/section.input';

@Controller('section')
export class SectionController {

  constructor(
    @InjectRepository(SectionEntity)
    private sectionRepo: Repository<SectionEntity>,
    private sectionService: SectionService,
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

  @Get('count')
  async getCount(
    @Query('filter')
      filter?: SectionFilterInput,
  ) {
    const where = {};

    if (filter?.flag) {
      where['flag'] = {flag: {id: filter.flag.eq}};
    }

    return this.sectionRepo.count({
      where,
    }).then(count => ({count}));
  }

  @Post()
  addItem(
    @Body()
      input: SectionInput,
  ) {
    return this.sectionService.insert(input)
      .then(res => this.sectionRepo.findOne({
        where: {id: res.id},
        relations: {
          string: {property: true},
          flag: {flag: true},
          point: {point: {directory: true}, property: true},
          block: true,
          parent: true,
        },
      }))
      .then(res => this.toView(res))
      .catch(err => {
        WrongDataException.assert(err.column !== 'blockId', 'Wrong block id!');
        throw err;
      });
  }

}
