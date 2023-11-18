import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContactEntity } from '../../model/user-contact.entity';

@Controller('contact')
export class ContactController {

  constructor(
    @InjectRepository(UserContactEntity)
    private contactRepo: Repository<UserContactEntity>,
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
      relations: {
        string: {property: true, lang: true},
        flag: {flag: true},
      },
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.contactRepo.count().then(count => ({count}));
  }

}
