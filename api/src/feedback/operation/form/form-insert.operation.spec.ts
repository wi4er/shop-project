import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { Form2flagEntity } from '../../model/form/form2flag.entity';
import { FormEntity } from '../../model/form/form.entity';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { FieldEntity } from '../../../settings/model/field/field.entity';

describe('Form addition', () => {
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

  describe('Form addition with fields', () => {
    test('Should add form', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .post('/feedback/form')
        .send({id: 'ORDER'})
        .expect(201);

      expect(inst.body.id).toBe('ORDER');
      expect(inst.body.created_at).toBeDefined();
      expect(inst.body.updated_at).toBeDefined();
      expect(inst.body.version).toBe(1);
    });

    test('Shouldn`t add with blank id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/feedback/form')
        .send({id: ''})
        .expect(400);
    });

    test('Shouldn`t add without id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/feedback/form')
        .send({})
        .expect(400);
    });
  });

  describe('Form addition with strings', () => {
    test('Should add with strings', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/feedback/form')
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
  });

  describe('Form addition with flag', () => {
    test('Should add flags', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const inst = await request(app.getHttpServer())
        .post('/feedback/form')
        .send({
          id: 'ORDER',
          flag: ['NEW'],
        })
        .expect(201);

      expect(inst.body.id).toBe('ORDER');
      expect(inst.body.flag).toEqual(['NEW']);
    });

    test('Should remove flags', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      const parent = await Object.assign(new FormEntity(), {id: 'PARENT'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'CHILD'}).save();
      await Object.assign(new Form2flagEntity(), {parent, flag}).save();

      const inst = await request(app.getHttpServer())
        .post('/feedback/form')
        .send({
          id: 'ORDER',
          flag: [],
        })
        .expect(201);

      expect(inst.body.id).toBe('ORDER');
      expect(inst.body.flag).toEqual([]);
    });
  });

  describe('Form addition with fields', () => {
    test('Should add field', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FieldEntity(), {id: 'DATA'}).save();

      const inst = await request(app.getHttpServer())
        .post('/feedback/form')
        .send({
          id: 'ORDER',
          field: ['DATA'],
        })
        .expect(201);

      expect(inst.body.id).toBe('ORDER');
      expect(inst.body.field).toEqual(['DATA']);
    });
  });
});