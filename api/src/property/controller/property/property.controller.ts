import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyEntity } from '../../model/property.entity';
import { PropertyService } from '../../service/property/property.service';
import { PropertyInput } from '../../input/property.input';

@Controller('property')
export class PropertyController {

  relations = {
    string: {property: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectRepository(PropertyEntity)
    private propertyRepo: Repository<PropertyEntity>,
    private propertyService: PropertyService,
  ) {
  }

  toView(item: PropertyEntity) {
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
    return this.propertyRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.propertyRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.propertyRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  async addItem(
    @Body()
      input: PropertyInput,
  ) {
    return this.propertyService.insert(input)
      .then(res => this.propertyRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

  @Put(':id')
  async updateItem(
    @Body()
      input: PropertyInput,
  ) {
    return this.propertyService.update(input)
      .then(res => this.propertyRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

}
