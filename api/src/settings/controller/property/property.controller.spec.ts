import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { PropertyEntity } from '../../model/property.entity';
import { Property2stringEntity } from '../../model/property2string.entity';
import { Property2flagEntity } from '../../model/property2flag.entity';
import { FlagEntity } from '../../model/flag.entity';
import { LangEntity } from '../../model/lang.entity';

describe('PropertyController', () => {
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

  describe('Property fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/property')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get property instance', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .get('/property/NAME')
        .expect(200);

      expect(res.body.id).toBe('NAME');
    });

    test('Should get property with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new PropertyEntity(), {id: `NAME_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/property?limit=5')
        .expect(200);

      expect(res.body).toHaveLength(5);
      expect(res.body[0].id).toBe('NAME_0');
      expect(res.body[4].id).toBe('NAME_4');
    });

    test('Should get property with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new PropertyEntity(), {id: `NAME_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/property?offset=5')
        .expect(200);

      expect(res.body).toHaveLength(5);
      expect(res.body[0].id).toBe('NAME_5');
      expect(res.body[4].id).toBe('NAME_9');
    });
  });

  describe('Property count', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/property/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get empty list', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new PropertyEntity(), {id: `NAME_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/property/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Property with strings', () => {
    test('Should get property with strings', async () => {
      const parent = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Property2stringEntity(), {parent, property: parent, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/property')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('NAME');
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
    });

    test('Should get property with lang strings', async () => {
      const parent = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Property2stringEntity(), {parent, property: parent, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/property')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].property[0].lang).toBe('EN');
      expect(res.body[0].property[0].string).toBe('VALUE');
    });
  });

  describe('Property with flags', () => {
    test('Should get property with flag', async () => {
      const parent = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Property2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/property')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });

  describe('Property addition', () => {
    test('Should add property', async () => {
      const item = await request(app.getHttpServer())
        .post('/property')
        .send({id: 'NAME'})
        .expect(201);

      expect(item.body.id).toBe('NAME');
    });
  });

  describe('Property update', () => {
    test('Should update property', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const item = await request(app.getHttpServer())
        .put('/property/NAME')
        .send({id: 'NAME'})
        .expect(200);

      expect(item.body.id).toBe('NAME');
    });
  });
});
