import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FlagEntity } from '../../../flag/model/flag.entity';
import { Repository } from 'typeorm';
import { FormEntity } from '../../model/form.entity';
import { FlagInput } from '../../../flag/input/flag.input';
import { FormInput } from '../../input/form.input';
import { FormService } from '../../service/form/form.service';

@Controller('form')
export class FormController {

  relations = {
    string: {property: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectRepository(FormEntity)
    private formRepo: Repository<FormEntity>,
    private formService: FormService,
  ) {
  }

  toView(item: FlagEntity) {
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
    return this.formRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.formRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.formRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  async addItem(
    @Body()
      input: FormInput,
  ) {
    return this.formService.insert(input)
      .then(res => this.formRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

  @Put(':id')
  async updateItem(
    @Body()
      input: FormInput,
  ) {
    return this.formService.update(input)
      .then(res => this.formRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

}
