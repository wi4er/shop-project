import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FlagEntity } from '../../../flag/model/flag.entity';
import { Repository } from 'typeorm';
import { LangEntity } from '../../model/lang.entity';

@Controller('lang')
export class LangController {

  constructor(
    @InjectRepository(LangEntity)
    private langRepo: Repository<LangEntity>,
  ) {
  }

  toView(item: LangEntity) {
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
    return this.langRepo.find({
      relations: {
        string: {property: true, lang: true},
        flag: {flag: true},
      },
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

}
