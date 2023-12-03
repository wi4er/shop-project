import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { UserContactEntity, UserContactType } from '../../model/user-contact.entity';
import { UserContact2stringEntity } from '../../model/user-contact2string.entity';
import { UserContact2flagEntity } from '../../model/user-contact2flag.entity';
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
      await Object.assign(new UserContactEntity(), {id: 'MAIL', type: UserContactType.EMAIL}).save();

      const res = await request(app.getHttpServer())
        .get('/contact/MAIL')
        .expect(200);

      expect(res.body.id).toBe('MAIL');
      expect(res.body.type).toBe('EMAIL');
    });

    test('Should get contact with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new UserContactEntity(),
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
          new UserContactEntity(),
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
          new UserContactEntity(),
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
        new UserContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new UserContact2stringEntity(), {parent, property, string: 'VALUE'}).save();

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
        new UserContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new UserContact2flagEntity(), {parent, flag}).save();

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
  });

  describe('Contact update', () => {
    test('Should update contact', async () => {
      await Object.assign(
        new UserContactEntity(),
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
  });
});
