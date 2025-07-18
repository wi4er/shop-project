import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { ContactEntity, UserContactType } from '../../model/contact/contact.entity';
import { Contact4stringEntity } from '../../model/contact/contact4string.entity';
import { Contact2flagEntity } from '../../model/contact/contact2flag.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('Contact Controller', () => {
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

  describe('Contact list', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/personal/contact')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get contact with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new ContactEntity(),
          {id: `MAIL_${i}`, type: UserContactType.EMAIL},
        ).save();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/contact?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('MAIL_9');
      expect(res.body[1].id).toBe('MAIL_8');
      expect(res.body[2].id).toBe('MAIL_7');
    });

    test('Should get contact with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new ContactEntity(),
          {id: `MAIL_${i}`, type: UserContactType.EMAIL},
        ).save();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/contact?offset=3')
        .expect(200);

      expect(res.body).toHaveLength(7);
      expect(res.body[0].id).toBe('MAIL_6');
      expect(res.body[6].id).toBe('MAIL_0');
    });
  });

  describe('Contact item', () => {
    test('Should get contact item', async () => {
      await Object.assign(new ContactEntity(), {id: 'MAIL', type: UserContactType.EMAIL}).save();

      const res = await request(app.getHttpServer())
        .get('/personal/contact/MAIL')
        .expect(200);

      expect(res.body.id).toBe('MAIL');
      expect(res.body.type).toBe('EMAIL');
    });
  });

  describe('Contact count', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/personal/contact/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get empty list', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new ContactEntity(),
          {id: `MAIL_${i}`, type: UserContactType.EMAIL},
        ).save();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/contact/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Contact with strings', () => {
    test('Should get contact with strings', async () => {
      const parent = await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Contact4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/personal/contact')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('MAIL');
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });
  });

  describe('Contact with flags', () => {
    test('Should get contact with flag', async () => {
      const parent = await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Contact2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/personal/contact')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });
});
