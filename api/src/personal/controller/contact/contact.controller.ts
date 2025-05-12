import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ContactEntity } from '../../model/contact/contact.entity';
import { ContactInput } from '../../input/contact.input';
import { UserContactInsertOperation } from '../../operation/contact/user-contact-insert.operation';
import { UserContactUpdateOperation } from '../../operation/contact/user-contact-update.operation';
import { UserContactDeleteOperation } from '../../operation/contact/user-contact-delete.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { ContactRender } from '../../render/contact.render';
import { NoDataException } from '../../../exception/no-data/no-data.exception';

@Controller('contact')
export class ContactController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
  } as FindOptionsRelations<ContactEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(ContactEntity)
    private contactRepo: Repository<ContactEntity>,
  ) {
  }

  /**
   *
   */
  toView(item: ContactEntity) {
    return new ContactRender(item);
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
      input: ContactInput,
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
      input: ContactInput,
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
      async trans => {
        NoDataException.assert(
          await trans.getRepository(ContactEntity).findOne({where: {id}}),
          `Contact with id >> ${id} << not found!`,
        );

        return new UserContactDeleteOperation(trans).save([id]);
      },
    );
  }

}
