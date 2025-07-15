import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FormEntity } from '../../model/form/form.entity';
import { Form4stringEntity } from '../../model/form/form4string.entity';
import { Form2flagEntity } from '../../model/form/form2flag.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { AccessTarget } from '../../../personal/model/access/access-target';

describe('Form Controller', () => {
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

  function createForm(id: string) {

  }

  describe('Form properties', () => {
    test('Should get empty list', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.FORM}).save();

      const res = await request(app.getHttpServer())
        .get('/feedback/form')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get list', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.FORM}).save();
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FormEntity(), {id: `form_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/feedback/form')
        .expect(200);

      expect(res.body).toHaveLength(10);
    });

    test('Shouldn`t get without access', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FormEntity(), {id: `form_${i}`}).save();
      }

      await request(app.getHttpServer())
        .get('/feedback/form')
        .expect(403);
    });

    test('Should get form with limit', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.FORM}).save();
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FormEntity(), {id: `form_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/feedback/form?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('form_0');
      expect(res.body[1].id).toBe('form_1');
      expect(res.body[2].id).toBe('form_2');
    });

    test('Should get form with offset', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.FORM}).save();
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FormEntity(), {id: `form_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/feedback/form?offset=9')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('form_9');
    });
  });

  describe('Form item', () => {
    test('Should get form item', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.FORM}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const res = await request(app.getHttpServer())
        .get('/feedback/form/ORDER')
        .expect(200);

      expect(res.body.id).toBe('ORDER');
    });

    test('Shouldn`t get item without access', async () => {
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      await request(app.getHttpServer())
        .get('/feedback/form/ORDER')
        .expect(403);
    });

    test('Shouldn`t get form with wrong id', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.FORM}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      await request(app.getHttpServer())
        .get('/feedback/form/WRONG')
        .expect(404);
    });
  });

  describe('Form count', () => {
    test('Should get empty count', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.FORM}).save();
      const res = await request(app.getHttpServer())
        .get('/feedback/form/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Shouldn`t get count without access', async () => {
      await request(app.getHttpServer())
        .get('/feedback/form/count')
        .expect(403);
    });

    test('Should get form count', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.FORM}).save();
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FormEntity(), {id: `form_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/feedback/form/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Form with strings', () => {
    test('Should get form with strings', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.FORM}).save();
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Form4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/feedback/form')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('FORM');
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });

    test('Should get form with lang strings', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.FORM}).save();
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Form4stringEntity(), {parent, attribute, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/feedback/form')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute[0].lang).toBe('EN');
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });
  });

  describe('Form with flags', () => {
    test('Should get form with flag', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.FORM}).save();
      const parent = await Object.assign(new FormEntity(), {id: 'ACTIVE'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Form2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/feedback/form')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });
});
