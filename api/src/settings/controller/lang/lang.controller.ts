import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LangEntity } from '../../model/lang.entity';
import { LangService } from '../../service/lang/lang.service';
import { FlagInput } from '../../input/flag.input';

@Controller('lang')
export class LangController {

  relations = {
    string: {property: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectRepository(LangEntity)
    private langRepo: Repository<LangEntity>,
    private langService: LangService,
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
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async countList() {
    return this.langRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.langRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  async addItem(
    @Body()
      input: FlagInput,
  ) {
    return this.langService.insert(input)
      .then(res => this.langRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

  @Put(':id')
  async updateItem(
    @Body()
      input: FlagInput,
  ) {
    return this.langService.update(input)
      .then(res => this.langRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

}
