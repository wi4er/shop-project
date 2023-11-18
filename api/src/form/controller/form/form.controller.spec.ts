import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FormEntity } from '../../model/form.entity';
import { FlagEntity } from '../../../flag/model/flag.entity';
import { PropertyEntity } from '../../../property/model/property.entity';
import { LangEntity } from '../../../lang/model/lang.entity';
import { Form2stringEntity } from '../../model/form2string.entity';
import { Form2flagEntity } from '../../model/form2flag.entity';

describe('FormController', () => {
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

  describe('Form fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get form instance', async () => {
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const res = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('ORDER');
    });

    test('Should get form with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FormEntity(), {id: `form_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/form?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('form_0');
      expect(res.body[1].id).toBe('form_1');
      expect(res.body[2].id).toBe('form_2');
    });

    test('Should get form with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FormEntity(), {id: `form_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/form?offset=9')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('form_9');
    });
  });

  describe('Form count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/form/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get form count', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FormEntity(), {id: `form_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/form/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Form with strings', () => {
    test('Should get flag with strings', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Form2stringEntity(), {parent, property, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('FORM');
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
    });

    test('Should get flag with lang strings', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Form2stringEntity(), {parent, property, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].property[0].lang).toBe('EN');
      expect(res.body[0].property[0].string).toBe('VALUE');
    });
  });

  describe('Form with flags', () => {
    test('Should get form with form', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'ACTIVE'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Form2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });
});
