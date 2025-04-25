import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FormEntity } from '../../model/form.entity';
import { Form4stringEntity } from '../../model/form4string.entity';
import { Form2flagEntity } from '../../model/form2flag.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';

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
        .get('/form/ORDER')
        .expect(200);

      expect(res.body.id).toBe('ORDER');
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
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Form4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('FORM');
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });

    test('Should get flag with lang strings', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Form4stringEntity(), {parent, attribute, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute[0].lang).toBe('EN');
      expect(res.body[0].attribute[0].string).toBe('VALUE');
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

  describe('Form addition', () => {
    test('Should add form', async () => {
      const inst = await request(app.getHttpServer())
        .post('/form')
        .send({id: 'ORDER'})
        .expect(201);

      expect(inst.body.id).toBe('ORDER');
      expect(inst.body.created_at).toBeDefined();
      expect(inst.body.updated_at).toBeDefined();
    });

    test('Should add with strings', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/form')
        .send({
          id: 'ORDER',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(201);

      expect(inst.body.id).toBe('ORDER');
      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Should add with flags', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const inst = await request(app.getHttpServer())
        .post('/form')
        .send({
          id: 'ORDER',
          flag: ['NEW'],
        })
        .expect(201);

      expect(inst.body.id).toBe('ORDER');
      expect(inst.body.flag).toEqual(['NEW']);
    });
  });

  describe('Form update', () => {
    test('Should update form', async () => {
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .put('/form/ORDER')
        .send({id: 'ORDER'})
        .expect(200);

      expect(inst.body.id).toBe('ORDER');
    });

    test('Should update id', async () => {
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .put('/form/ORDER')
        .send({id: 'UPDATED'})
        .expect(200);

      expect(inst.body.id).toBe('UPDATED');
    });

    test('Should add strings', async () => {
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .put('/form/ORDER')
        .send({
          id: 'ORDER',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(200);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Should update strings', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Form4stringEntity(), {attribute, parent, string: 'OLD'}).save();

      const inst = await request(app.getHttpServer())
        .put('/form/ORDER')
        .send({
          id: 'UPDATED',
          attribute: [
            {attribute: 'NAME', string: 'NEW'},
          ],
        })
        .expect(200);

      expect(inst.body.id).toBe('UPDATED');
      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('NEW');
    });

    test('Should add flags', async () => {
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .put('/form/ORDER')
        .send({
          id: 'ORDER',
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });
  });
});
