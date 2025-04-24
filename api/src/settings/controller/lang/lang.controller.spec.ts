import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { LangEntity } from '../../model/lang.entity';
import { Lang4stringEntity } from '../../model/lang4string.entity';
import { Lang2flagEntity } from '../../model/lang2flag.entity';
import { AttributeEntity } from '../../model/attribute.entity';
import { FlagEntity } from '../../model/flag.entity';

describe('LangController', () => {
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

  describe('Lang fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/lang')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get lang with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new LangEntity(), {id: `LANG_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/lang?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('LANG_0');
      expect(res.body[1].id).toBe('LANG_1');
      expect(res.body[2].id).toBe('LANG_2');
    });

    test('Should get lang with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new LangEntity(), {id: `LANG_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/lang?offset=3')
        .expect(200);

      expect(res.body).toHaveLength(7);
      expect(res.body[0].id).toBe('LANG_3');
      expect(res.body[6].id).toBe('LANG_9');
    });
  });

  describe('Lang item', () => {
    test('Should get lang instance', async () => {
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const res = await request(app.getHttpServer())
        .get('/lang/EN')
        .expect(200);

      expect(res.body.id).toBe('EN');
    });

    test('Shouldn`t get with wrong id', async () => {
      const res = await request(app.getHttpServer())
        .get('/lang/WONG')
        .expect(404);
    });
  });

  describe('Lang count', () => {
    test('Should count empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/lang/count')
        .expect(200);

      expect(res.body.count).toBe(0);
    });

    test('Should count lang list', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new LangEntity(), {id: `LANG_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/lang/count')
        .expect(200);

      expect(res.body.count).toBe(10);
    });
  });

  describe('Lang with strings', () => {
    test('Should get lang with strings', async () => {
      const parent = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Lang4stringEntity(), {parent, attribute, string: 'English'}).save();

      const res = await request(app.getHttpServer())
        .get('/lang')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('EN');
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('English');
    });

    test('Should get lang with lang strings', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang1 = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const lang2 = await Object.assign(new LangEntity(), {id: 'GR'}).save();
      await Object.assign(
        new Lang4stringEntity(),
        {parent: lang1, attribute, lang: lang1, string: 'English'},
      ).save();
      await Object.assign(
        new Lang4stringEntity(),
        {parent: lang1, attribute, lang: lang2, string: 'English'},
      ).save();

      const res = await request(app.getHttpServer())
        .get('/lang')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].attribute[0].lang).toBe('EN');
      expect(res.body[0].attribute[0].string).toBe('English');
      expect(res.body[0].attribute[1].lang).toBe('GR');
      expect(res.body[0].attribute[1].string).toBe('English');
    });
  });

  describe('Lang with flags', () => {
    test('Should get lang with flag', async () => {
      const parent = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Lang2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/lang')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });

  describe('Lang addition', () => {
    test('Should add item', async () => {
      const res = await request(app.getHttpServer())
        .post('/lang')
        .send({id: 'EN'})
        .expect(201);

      expect(res.body.id).toBe('EN');
    });

    test('Shouldn`t add with duplicate id', async () => {
      await request(app.getHttpServer())
        .post('/lang')
        .send({id: 'EN'})
        .expect(201);

      await request(app.getHttpServer())
        .post('/lang')
        .send({id: 'EN'})
        .expect(400);
    });

    test('Should add with strings', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .post('/lang')
        .send({
          id: 'EN',
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(201);

      expect(res.body.id).toBe('EN');
      expect(res.body.attribute[0].attribute).toBe('NAME');
      expect(res.body.attribute[0].string).toBe('VALUE');
    });

    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const res = await request(app.getHttpServer())
        .post('/lang')
        .send({
          id: 'EN',
          flag: ['NEW'],
        })
        .expect(201);

      expect(res.body.flag).toEqual(['NEW']);
    });
  });

  describe('Lang update', () => {
    test('Should update item', async () => {
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const res = await request(app.getHttpServer())
        .put('/lang/EN')
        .send({id: 'EN'})
        .expect(200);

      expect(res.body.id).toBe('EN');
    });

    test('Should update id', async () => {
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const res = await request(app.getHttpServer())
        .put('/lang/EN')
        .send({id: 'GR'})
        .expect(200);

      expect(res.body.id).toBe('GR');
    });

    test('Should update id with string', async () => {
      const parent = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Lang4stringEntity(), {parent, attribute, string: 'English'}).save();

      const res = await request(app.getHttpServer())
        .put('/lang/EN')
        .send({id: 'GR', attribute: [{attribute: 'NAME', string: 'English'}]})
        .expect(200);

      expect(res.body.id).toBe('GR');
      expect(res.body.attribute).toEqual([{attribute: 'NAME', string: 'English'}]);
    });

    test('Should update id with flag', async () => {
      const parent = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Lang2flagEntity(), {parent, flag}).save();

      const res = await request(app.getHttpServer())
        .put('/lang/EN')
        .send({id: 'GR', flag: ['FLAG']})
        .expect(200);

      expect(res.body.id).toBe('GR');
      expect(res.body.flag).toEqual(['FLAG']);
    });
  });
});
