import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import * as request from 'supertest';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { FieldEntity } from '../../../settings/model/field/field.entity';

describe('Document addition', () => {
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

  describe('Document addition with fields', () => {
    test('Should add item', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .post('/bundle/document')
        .send({})
        .expect(201);

      expect(inst.body.id).toHaveLength(36);
    });

    test('Shouldn`t add without access', async () => {
      await request(app.getHttpServer())
        .post('/bundle/document')
        .send({})
        .expect(403);
    });
  });

  describe('Document addition with strings', () => {
    test('Should add with string', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .post('/bundle/document')
        .send({
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(201);

      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Shouldn`t add with wrong attribute', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/bundle/document')
        .send({
          attribute: [{attribute: 'WRONG', string: 'VALUE'}],
        })
        .expect(400);
    });

    test('Shouldn`t add without attribute', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/bundle/document')
        .send({
          attribute: [{string: 'VALUE'}],
        })
        .expect(400);
    });
  });

  describe('Document addition with flags', () => {
    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .post('/bundle/document')
        .send({
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });

    test('Shouldn`t add with wrong flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/bundle/document')
        .send({
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });

  describe('Document addition with fields', () => {
    test('Should add with field', async () => {
      await Object.assign(new FieldEntity(), {id: 'DATA'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .post('/bundle/document')
        .send({
          field: ['DATA'],
        })
        .expect(201);

      expect(inst.body.field).toEqual(['DATA']);
    });

    test('Shouldn`t add with wrong field', async () => {
      await Object.assign(new FieldEntity(), {id: 'DATA'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/bundle/document')
        .send({
          field: ['WRONG'],
        })
        .expect(400);
    });

    test('Shouldn`t add with duplicate field', async () => {
      await Object.assign(new FieldEntity(), {id: 'DATA'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/bundle/document')
        .send({
          field: ['DATA', 'DATA'],
        })
        .expect(400);
    });
  });
});