import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FlagEntity } from '../../../flag/model/flag.entity';
import { PropertyEntity } from '../../model/property.entity';
import { LangEntity } from '../../../lang/model/lang.entity';
import { Property2stringEntity } from '../../model/property2string.entity';
import { Property2flagEntity } from '../../model/property2flag.entity';

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
        .get('/property')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('NAME');
    });
  });

  describe('Property with strings', () => {
    test('Should get property with strings', async () => {
      const parent =await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
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
});