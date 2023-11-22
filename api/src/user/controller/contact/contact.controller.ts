import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContactEntity } from '../../model/user-contact.entity';
import { FlagInput } from '../../../flag/input/flag.input';
import { ContactService } from '../../service/contact/contact.service';
import { UserContactInput } from '../../input/user-contact.input';

@Controller('contact')
export class ContactController {

  relations = {
    string: {property: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectRepository(UserContactEntity)
    private contactRepo: Repository<UserContactEntity>,
    private contactService: ContactService,
  ) {
  }

  toView(item: UserContactEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      type: item.type,
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
    return this.contactRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.contactRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.contactRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  async addItem(
    @Body()
      input: UserContactInput,
  ) {
    return this.contactService.insert(input)
      .then(res => this.contactRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

  @Put(':id')
  async updateItem(
    @Body()
      input: UserContactInput,
  ) {
    return this.contactService.update(input)
      .then(res => this.contactRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

}
