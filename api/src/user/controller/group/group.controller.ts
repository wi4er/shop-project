import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupEntity } from '../../model/user-group.entity';

@Controller('group')
export class GroupController {

  constructor(
    @InjectRepository(UserGroupEntity)
    private groupRepo: Repository<UserGroupEntity>,
  ) {
  }

  toView(item: UserGroupEntity) {
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
    return this.groupRepo.find({
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
    return this.groupRepo.count().then(count => ({count}));
  }

}
