import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { ContactEntity, UserContactType } from '../../model/contact/contact.entity';
import * as request from 'supertest';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('Contact updating', () => {
  let source: DataSource;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule({imports: [AppModule]}).compile();
    app = moduleBuilder.createNestApplication();
    await app.init();

    source = await createConnection(createConnectionOptions());
  });
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Contact update', () => {
    test('Should update contact', async () => {
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      const inst = await request(app.getHttpServer())
        .put('/personal/contact/MAIL')
        .send({
          id: 'MAIL',
          type: 'PHONE',
        })
        .expect(200);

      expect(inst.body.id).toBe('MAIL');
      expect(inst.body.type).toBe('PHONE');
    });

  });

  describe('Contact update with strings', () => {
    test('Should add string to contact', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      const inst = await request(app.getHttpServer())
        .put('/personal/contact/MAIL')
        .send({
          id: 'MAIL',
          type: 'PHONE',
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(200);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Shouldn`t add with wrong attribute', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      await request(app.getHttpServer())
        .put('/personal/contact/MAIL')
        .send({
          id: 'MAIL',
          type: 'PHONE',
          attribute: [{attribute: 'WRONG', string: 'VALUE'}],
        })
        .expect(400);
    });
  });

  describe('Contact update with flags', () => {
    test('Should add flag to contact', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      const inst = await request(app.getHttpServer())
        .put('/personal/contact/MAIL')
        .send({
          id: 'MAIL',
          type: 'PHONE',
          flag: ['NEW'],
        })
        .expect(200);

      expect(inst.body.flag).toEqual(['NEW']);
    });

    test('Shouldn`t add wrong flag to contact', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      await request(app.getHttpServer())
        .put('/personal/contact/MAIL')
        .send({
          id: 'MAIL',
          type: 'PHONE',
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });
});