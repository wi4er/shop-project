import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FormEntity } from '../../model/form/form.entity';
import * as request from 'supertest';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { Form4stringEntity } from '../../model/form/form4string.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { FieldEntity } from '../../../settings/model/field/field.entity';
import { Form2flagEntity } from '../../model/form/form2flag.entity';

describe('Form update', () => {
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

  describe('Form field update ', () => {
    test('Should update form', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({id: 'ORDER'})
        .expect(200);

      expect(inst.body.id).toBe('ORDER');
    });

    test('Should update id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({id: 'UPDATED'})
        .expect(200);

      expect(inst.body.id).toBe('UPDATED');
    });

    test('Shouldn`t without id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({})
        .expect(400);
    });

    test('Shouldn`t update to blank id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({id: ''})
        .expect(400);
    });
  });

  describe('Form version update ', () => {
    test('Should update version', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({id: 'ORDER'})
        .expect(200);

      expect(inst.body.version).toBe(2);
    });

    test('Should update from flag', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      const parent = await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'BEFORE'}).save();
      await Object.assign(new FlagEntity(), {id: 'AFTER'}).save();
      await Object.assign(new Form2flagEntity(), {parent, flag}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({id: 'ORDER', flag: ['AFTER']})
        .expect(200);

      expect(inst.body.version).toBe(2);
    });
  });

  describe('Form update with string', () => {
    test('Should add strings', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
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
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      const parent = await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Form4stringEntity(), {attribute, parent, string: 'OLD'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
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

  });

  describe('Form update with flags', () => {
    test('Should add flags', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({
          id: 'ORDER',
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('Form update with fields', () => {
    test('Should add field', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      await Object.assign(new FieldEntity(), {id: 'DATA'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({
          id: 'ORDER',
          field: ['DATA'],
        })
        .expect(200);

      expect(inst.body.field).toEqual(['DATA']);
    });
  });

  describe('Form update with logs', () => {
    describe('Form update with property logs', () => {
      test('Shouldn`t log without flag update', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
        await Object.assign(new FormEntity(), {id: 'OLD'}).save();

        const inst = await request(app.getHttpServer())
          .put('/feedback/form/OLD')
          .send({id: 'NEW'})
          .expect(200);

        const log = await request(app.getHttpServer())
          .get('/feedback/form-log/NEW')
          .expect(200);

        expect(log.body).toHaveLength(1);
      });
    });

    describe('Form update with flag logs', () => {
      test('Shouldn`t log without flag update', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
        const parent = await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
        const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
        await Object.assign(new Form2flagEntity(), {parent, flag}).save();

        await request(app.getHttpServer())
          .put('/feedback/form/ORDER')
          .send({id: 'ORDER', flag: ['FLAG']})
          .expect(200);

        const log = await request(app.getHttpServer())
          .get('/feedback/form-log/ORDER')
          .expect(200);

        expect(log.body).toHaveLength(0);
      });

      test('Should log flag update', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
        const parent = await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
        const flag = await Object.assign(new FlagEntity(), {id: 'BEFORE'}).save();
        await Object.assign(new FlagEntity(), {id: 'AFTER'}).save();
        await Object.assign(new Form2flagEntity(), {parent, flag}).save();

        await request(app.getHttpServer())
          .put('/feedback/form/ORDER')
          .send({id: 'ORDER', flag: ['AFTER']})
          .expect(200);

        const log = await request(app.getHttpServer())
          .get('/feedback/form-log/ORDER')
          .expect(200);

        expect(log.body[0].items).toHaveLength(2);
        expect(log.body[0].items).toContainEqual({value: 'flag.AFTER', from: null, to: 'AFTER'});
        expect(log.body[0].items).toContainEqual({value: 'flag.BEFORE', from: 'BEFORE', to: null});
      });
    });

    describe('Form update with string logs', () => {
      test('Should log string attribute addition', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        await request(app.getHttpServer())
          .post('/feedback/form')
          .send({
            id: 'ORDER',
          })
          .expect(201);

        await request(app.getHttpServer())
          .put('/feedback/form/ORDER')
          .send({
            id: 'ORDER',
            attribute: [{attribute: 'NAME', string: 'VALUE'}],
          })
          .expect(200);

        const log = await request(app.getHttpServer())
          .get('/feedback/form-log/ORDER')
          .expect(200);

        expect(log.body).toHaveLength(2);
        expect(log.body[0].version).toBe(1);
        expect(log.body[0].items[0].value).toBe('property.ID');
        expect(log.body[1].version).toBe(2);
        expect(log.body[1].items[0].value).toBe('attribute.NAME');
      });

      test('Should log string attribute update', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        await request(app.getHttpServer())
          .post('/feedback/form')
          .send({
            id: 'ORDER',
            attribute: [{attribute: 'NAME', string: 'OLD'}],
          })
          .expect(201);

        await request(app.getHttpServer())
          .put('/feedback/form/ORDER')
          .send({
            id: 'ORDER',
            attribute: [{attribute: 'NAME', string: 'UPDATE'}],
          })
          .expect(200);

        const log = await request(app.getHttpServer())
          .get('/feedback/form-log/ORDER')
          .expect(200);

        expect(log.body).toHaveLength(2);
        expect(log.body[0].version).toBe(1);
        expect(log.body[0].items[0].value).toBe('property.ID');
        expect(log.body[1].version).toBe(2);
        expect(log.body[1].items[0]).toEqual(
          {value: 'attribute.NAME', from: 'OLD', to: 'UPDATE'},
        );
      });

      test('Should log string attribute multi update', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        await request(app.getHttpServer())
          .post('/feedback/form')
          .send({
            id: 'ORDER',
            attribute: [
              {attribute: 'NAME', string: 'VALUE_1'},
              {attribute: 'NAME', string: 'VALUE_2'},
            ],
          })
          .expect(201);

        await request(app.getHttpServer())
          .put('/feedback/form/ORDER')
          .send({
            id: 'ORDER',
            attribute: [
              {attribute: 'NAME', string: 'VALUE_1'},
              {attribute: 'NAME', string: 'VALUE_3'},
              {attribute: 'NAME', string: 'VALUE_4'},
            ],
          })
          .expect(200);

        const log = await request(app.getHttpServer())
          .get('/feedback/form-log/ORDER')
          .expect(200);

        expect(log.body).toHaveLength(2);
        expect(log.body[1].items[0]).toEqual({value: 'attribute.NAME', from: 'VALUE_2', to: 'VALUE_3'});
        expect(log.body[1].items[1]).toEqual({value: 'attribute.NAME', from: null, to: 'VALUE_4'});
      });

      test('Shouldn`t log string attribute without change', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const parent = await Object.assign(new FormEntity(), {id: 'DATA'}).save();
        await Object.assign(new Form4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

        await request(app.getHttpServer())
          .put('/feedback/form/DATA')
          .send({
            id: 'DATA',
            attribute: [{attribute: 'NAME', string: 'VALUE'}],
          })
          .expect(200);

        const log = await request(app.getHttpServer())
          .get('/feedback/form-log/DATA')
          .expect(200);

        expect(log.body).toHaveLength(0);
      });

      test('Should log string attribute removal', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const parent = await Object.assign(new FormEntity(), {id: 'DATA'}).save();
        await Object.assign(new Form4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

        await request(app.getHttpServer())
          .put('/feedback/form/DATA')
          .send({
            id: 'DATA',
            attribute: [],
          })
          .expect(200);

        const log = await request(app.getHttpServer())
          .get('/feedback/form-log/DATA')
          .expect(200);

        expect(log.body[0].version).toBe(2);
        expect(log.body[0].items[0]).toEqual(
          {value: 'attribute.NAME', from: 'VALUE', to: null},
        );
      });
    });
  });
});
