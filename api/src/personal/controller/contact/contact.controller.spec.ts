import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { ContactEntity, UserContactType } from '../../model/contact.entity';
import { Contact4stringEntity } from '../../model/contact4string.entity';
import { Contact2flagEntity } from '../../model/contact2flag.entity';
import { PropertyEntity } from '../../../settings/model/property.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';

describe('ContactController', () => {
  let source;
  let app;

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule({imports: [AppModule]}).compile();
    app = moduleBuilder.createNestApplication();
    app.init();

    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Contact fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/contact')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get contact instance', async () => {
      await Object.assign(new ContactEntity(), {id: 'MAIL', type: UserContactType.EMAIL}).save();

      const res = await request(app.getHttpServer())
        .get('/contact/MAIL')
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
        .get('/contact?limit=3')
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
        .get('/contact?offset=3')
        .expect(200);

      expect(res.body).toHaveLength(7);
      expect(res.body[0].id).toBe('MAIL_3');
      expect(res.body[6].id).toBe('MAIL_9');
    });
  });

  describe('Contact count', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/contact/count')
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
        .get('/contact/count')
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
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Contact4stringEntity(), {parent, property, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/contact')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('MAIL');
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
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
        .get('/contact')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });

  describe('Contact addition', () => {
    test('Should add', async () => {
      const inst = await request(app.getHttpServer())
        .post('/contact')
        .send({
          id: 'mail',
          type: 'EMAIL',
        })
        .expect(201);
    });

    test('Shouldn`t add without type', async () => {
      const inst = await request(app.getHttpServer())
        .post('/contact')
        .send({id: 'mail'})
        .expect(400);
    });

    test('Shouldn`t add without id', async () => {
      const inst = await request(app.getHttpServer())
        .post('/contact')
        .send({type: 'EMAIL'})
        .expect(400);
    });

    test('Shouldn`t add with blank id', async () => {
      const inst = await request(app.getHttpServer())
        .post('/contact')
        .send({id: '', type: 'EMAIL'})
        .expect(400);
    });
  });

  describe('Contact update', () => {
    test('Should update contact', async () => {
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      const inst = await request(app.getHttpServer())
        .put('/contact/MAIL')
        .send({
          id: 'MAIL',
          type: 'PHONE',
        })
        .expect(200);

      expect(inst.body.id).toBe('MAIL');
      expect(inst.body.type).toBe('PHONE');
    });

    test('Should add string to contact', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      const inst = await request(app.getHttpServer())
        .put('/contact/MAIL')
        .send({
          id: 'MAIL',
          type: 'PHONE',
          property: [{property: 'NAME', string: 'VALUE'}],
        })
        .expect(200);

      expect(inst.body.property).toHaveLength(1);
      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].string).toBe('VALUE');
    });

    test('Shouldn`t add with wrong property', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      await request(app.getHttpServer())
        .put('/contact/MAIL')
        .send({
          id: 'MAIL',
          type: 'PHONE',
          property: [{property: 'WRONG', string: 'VALUE'}],
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
        .put('/contact/MAIL')
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

      const inst = await request(app.getHttpServer())
        .put('/contact/MAIL')
        .send({
          id: 'MAIL',
          type: 'PHONE',
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });

  describe('Contact delete', () => {
    test('Should delete contact', async () => {
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      const inst = await request(app.getHttpServer())
        .delete('/contact/MAIL')
        .expect(200);

      expect(inst.body).toEqual(['MAIL']);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      const inst = await request(app.getHttpServer())
        .delete('/contact/WRONG')
        .expect(404);
    });
  });
});
