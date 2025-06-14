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

  describe('Contact fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/personal/contact')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get contact instance', async () => {
      await Object.assign(new ContactEntity(), {id: 'MAIL', type: UserContactType.EMAIL}).save();

      const res = await request(app.getHttpServer())
        .get('/personal/contact/MAIL')
        .expect(200);

      expect(res.body.id).toBe('MAIL');
      expect(res.body.type).toBe('EMAIL');
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
      expect(res.body[0].id).toBe('MAIL_0');
      expect(res.body[1].id).toBe('MAIL_1');
      expect(res.body[2].id).toBe('MAIL_2');
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
      expect(res.body[0].id).toBe('MAIL_3');
      expect(res.body[6].id).toBe('MAIL_9');
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

  describe('Contact addition', () => {
    describe('Contact addition with fields', () => {
      test('Should add contact', async () => {
        const inst = await request(app.getHttpServer())
          .post('/personal/contact')
          .send({
            id: 'mail',
            type: 'EMAIL',
          })
          .expect(201);

        expect(inst.body.id).toBe('mail');
        expect(inst.body.type).toBe('EMAIL');
      });

      test('Shouldn`t add without type', async () => {
        await request(app.getHttpServer())
          .post('/personal/contact')
          .send({id: 'mail'})
          .expect(400);
      });

      test('Shouldn`t add with wrong type', async () => {
        await request(app.getHttpServer())
          .post('/personal/contact')
          .send({id: 'mail', type: 'WRONG'})
          .expect(400);
      });

      test('Shouldn`t add without id', async () => {
        await request(app.getHttpServer())
          .post('/personal/contact')
          .send({type: 'EMAIL'})
          .expect(400);
      });

      test('Shouldn`t add with blank id', async () => {
        await request(app.getHttpServer())
          .post('/personal/contact')
          .send({id: '', type: 'EMAIL'})
          .expect(400);
      });
    });
  });

  describe('ContactEntity update', () => {
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

  describe('ContactEntity delete', () => {
    test('Should delete contact', async () => {
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      const inst = await request(app.getHttpServer())
        .delete('/personal/contact/MAIL')
        .expect(200);

      expect(inst.body).toEqual(['MAIL']);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      await request(app.getHttpServer())
        .delete('/personal/contact/WRONG')
        .expect(404);
    });
  });
});
