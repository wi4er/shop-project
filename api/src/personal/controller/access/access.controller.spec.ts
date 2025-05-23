import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { AccessEntity } from '../../model/access/access.entity';
import { AccessTarget } from '../../model/access/access-target';
import { AccessMethod } from '../../model/access/access-method';

describe('Access Controller', () => {
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

  async function createAccess(
    target = AccessTarget.ALL,
    method = AccessMethod.ALL,
  ): Promise<AccessEntity> {
    const inst = new AccessEntity();
    inst.method = method;
    inst.target = target;

    return inst.save();
  }

  describe('Access fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/personal/access')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get list', async () => {
      for (let i = 0; i < 10; i++) {
        await createAccess();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/access')
        .expect(200);

      console.log(res.body);
      // expect(res.body).toHaveLength(10);
    });

    test('Should get list with target filter', async () => {
      for (let i = 0; i < 10; i++) {
        await createAccess(i % 2 ? AccessTarget.ALL : AccessTarget.FLAG);
      }

      const res = await request(app.getHttpServer())
        .get('/personal/access?target=FLAG')
        .expect(200);

      expect(res.body).toHaveLength(5);

      console.log(res.body);
    });

    test('Should get list with method filter', async () => {
      for (let i = 0; i < 10; i++) {
        await createAccess(AccessTarget.ALL, i % 2 ? AccessMethod.ALL : AccessMethod.POST);
      }

      const res = await request(app.getHttpServer())
        .get('/personal/access?method=POST')
        .expect(200);

      expect(res.body).toHaveLength(5);
    });
  });

  describe('Access item', () => {
    test('Should get item', async () => {
      const parent = await createAccess(AccessTarget.DIRECTORY, AccessMethod.GET);

      const res = await request(app.getHttpServer())
        .get(`/personal/access/${parent.id}`)
        .expect(200);

      expect(res.body.id).toBe(1);
      expect(res.body).toMatchObject({
        target: 'DIRECTORY',
        method: 'GET',
      });
    });

    test('Shouldn`t get with wrong id', async () => {
      await createAccess(AccessTarget.DIRECTORY, AccessMethod.GET);

      await request(app.getHttpServer())
        .get(`/personal/access/7777`)
        .expect(404);
    });
  });

  describe('Access count', () => {
    test('Should get zero count', async () => {
      const res = await request(app.getHttpServer())
        .get('/personal/access/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get count', async () => {
      for (let i = 0; i < 7; i++) {
        await createAccess();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/access/count')
        .expect(200);

      expect(res.body).toEqual({count: 7});
    });

    test('Should get count with target filter', async () => {
      for (let i = 0; i < 12; i++) {
        await createAccess(i % 2 ? AccessTarget.ALL : AccessTarget.FLAG);
      }

      const res = await request(app.getHttpServer())
        .get('/personal/access/count?target=FLAG')
        .expect(200);

      expect(res.body).toEqual({count: 6});
    });

    test('Should get count with method filter', async () => {
      for (let i = 0; i < 8; i++) {
        await createAccess(AccessTarget.ALL, i % 2 ? AccessMethod.ALL : AccessMethod.POST);
      }

      const res = await request(app.getHttpServer())
        .get('/personal/access/count?method=POST')
        .expect(200);

      expect(res.body).toEqual({count: 4});
    });
  });

  describe('Access addition', () => {
    test('Should add access', async () => {
      const inst = await request(app.getHttpServer())
        .post(`/personal/access`)
        .send({
          target: 'BLOCK',
          method: 'GET',
        })
        .expect(201);

      expect(inst.body).toMatchObject({
        target: 'BLOCK',
        method: 'GET',
      });
    });

    test('Shouldn`t add with wrong target', async () => {
      await request(app.getHttpServer())
        .post(`/personal/access`)
        .send({
          target: 'WRONG',
          method: 'GET',
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong method', async () => {
      await request(app.getHttpServer())
        .post(`/personal/access`)
        .send({
          target: 'BLOCK',
          method: 'WRONG',
        })
        .expect(400);
    });
  });

  describe('Access updating', () => {
    test('Should update access', async () => {
      const parent = await createAccess(AccessTarget.DIRECTORY, AccessMethod.DELETE);

      const inst = await request(app.getHttpServer())
        .put(`/personal/access/${parent.id}`)
        .send({
          target: 'BLOCK',
          method: 'GET',
        })
        .expect(200);

      expect(inst.body).toMatchObject({
        target: 'BLOCK',
        method: 'GET',
      });
    });

    test('Shouldn`t update with wrong target', async () => {
      const parent = await createAccess(AccessTarget.DIRECTORY, AccessMethod.DELETE);

      await request(app.getHttpServer())
        .put(`/personal/access/${parent.id}`)
        .send({
          target: 'WRONG',
          method: 'GET',
        })
        .expect(400);
    });

    test('Shouldn`t update with wrong methods', async () => {
      const parent = await createAccess(AccessTarget.DIRECTORY, AccessMethod.DELETE);

      await request(app.getHttpServer())
        .put(`/personal/access/${parent.id}`)
        .send({
          target: 'BLOCK',
          method: 'WRONG',
        })
        .expect(400);
    });
  });
});
