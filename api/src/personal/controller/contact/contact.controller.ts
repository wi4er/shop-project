import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ContactEntity } from '../../model/contact.entity';
import { UserContactInput } from '../../input/user-contact.input';
import { UserContactInsertOperation } from '../../operation/user-contact-insert.operation';
import { UserContactUpdateOperation } from '../../operation/user-contact-update.operation';
import { UserContactDeleteOperation } from '../../operation/user-contact-delete.operation';

@Controller('contact')
export class ContactController {

  relations = {
    string: {property: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(ContactEntity)
    private contactRepo: Repository<ContactEntity>,
  ) {
  }

  toView(item: ContactEntity) {
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
    return this.entityManager.transaction(
      trans => new UserContactInsertOperation(this.entityManager).save(input)
        .then(id => trans.getRepository(ContactEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: UserContactInput,
  ) {
    return this.entityManager.transaction(
      trans => new UserContactUpdateOperation(this.entityManager).save(id, input)
        .then(contactId => trans.getRepository(ContactEntity).findOne({
          where: {id: contactId},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete(':id')
  async deleteItem(
    @Param('id')
      id: string,
  ) {
    return this.entityManager.transaction(
      trans => new UserContactDeleteOperation(this.entityManager).save([id]),
    );
  }

}
