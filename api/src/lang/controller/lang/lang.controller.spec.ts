import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FlagEntity } from '../../../flag/model/flag.entity';
import { PropertyEntity } from '../../../property/model/property.entity';
import { LangEntity } from '../../model/lang.entity';
import { Lang2stringEntity } from '../../model/lang2string.entity';
import { Lang2flagEntity } from '../../model/lang2flag.entity';

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

    test('Should get lang instance', async () => {
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const res = await request(app.getHttpServer())
        .get('/lang')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('EN');
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

  describe('Lang with strings', () => {
    test('Should get lang with strings', async () => {
      const parent = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Lang2stringEntity(), {parent, property, string: 'English'}).save();

      const res = await request(app.getHttpServer())
        .get('/lang')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('EN');
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('English');
    });

    test('Should get lang with lang strings', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang1 = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const lang2 = await Object.assign(new LangEntity(), {id: 'GR'}).save();
      await Object.assign(
        new Lang2stringEntity(),
        {parent: lang1, property, lang: lang1, string: 'English'},
      ).save();
      await Object.assign(
        new Lang2stringEntity(),
        {parent: lang1, property, lang: lang2, string: 'Englisch'},
      ).save();

      const res = await request(app.getHttpServer())
        .get('/lang')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].property[0].lang).toBe('EN');
      expect(res.body[0].property[0].string).toBe('English');
      expect(res.body[0].property[1].lang).toBe('GR');
      expect(res.body[0].property[1].string).toBe('Englisch');
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
});
