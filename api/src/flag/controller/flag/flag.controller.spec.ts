import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FlagEntity } from '../../model/flag.entity';
import { PropertyEntity } from '../../../property/model/property.entity';
import { LangEntity } from '../../../lang/model/lang.entity';
import { Flag2stringEntity } from '../../model/flag2string.entity';
import { Flag2flagEntity } from '../../model/flag2flag.entity';

describe('FlagController', () => {
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

  describe('Flag fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get flag instance', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const res = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('ACTIVE');
    });

    test('Should get flag with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FlagEntity(), {id: `flag_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/flag?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('flag_0');
      expect(res.body[1].id).toBe('flag_1');
      expect(res.body[2].id).toBe('flag_2');
    });

    test('Should get flag with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FlagEntity(), {id: `flag_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/flag?offset=9')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('flag_9');
    });
  });

  describe('Flag with strings', () => {
    test('Should get flag with strings', async () => {
      const parent =await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Flag2stringEntity(), {parent, property, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('ACTIVE');
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
    });

    test('Should get flag with lang strings', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Flag2stringEntity(), {parent, property, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].property[0].lang).toBe('EN');
      expect(res.body[0].property[0].string).toBe('VALUE');
    });
  });

  describe('Flag with flags', () => {
    test('Should get flag with flag', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Flag2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(list.body).toHaveLength(2);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });
});
