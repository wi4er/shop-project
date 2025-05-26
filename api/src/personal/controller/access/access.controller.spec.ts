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

  function createAccess(
    target = AccessTarget.ALL,
    method1 = AccessMethod.ALL,
  ): Promise<AccessEntity> & any {
    const item = new AccessEntity();
    item.method = AccessMethod.ALL;
    item.target = AccessTarget.ALL;

    let method = AccessMethod.ALL;

    return Object.assign(Promise.resolve({
      then: resolve => resolve(
        source.getRepository(AccessEntity)
          .findOne({where: {method, target: AccessTarget.ACCESS}})
          .then(inst => {
            if (!inst && method) return Object.assign(new AccessEntity(), {
              method,
              target: AccessTarget.ACCESS,
            }).save();
          })
          .then(() => item.save()),
      ),
    }), {
      withAccess(updated: AccessMethod) {
        method = updated;
        return this;
      },
      withMethod(method: AccessMethod) {
        item.method = method;
        return this;
      },
      withTarget(target: AccessTarget) {
        item.target = target;
        return this;
      },
    });
  }

  describe('Access fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/personal/access')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get list', async () => {
      await createAccess().withTarget(AccessTarget.FLAG);
      await createAccess().withTarget(AccessTarget.FLAG).withMethod(AccessMethod.GET);
      await createAccess().withTarget(AccessTarget.FLAG).withMethod(AccessMethod.POST);

      const res = await request(app.getHttpServer())
        .get('/personal/access')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[1].group).toHaveLength(3);
    });
  });

  describe('Access item', () => {
    test('Should get access item', async () => {
      await createAccess().withTarget(AccessTarget.FLAG);
      await createAccess().withTarget(AccessTarget.FLAG).withMethod(AccessMethod.GET);
      await createAccess().withTarget(AccessTarget.ATTRIBUTE);

      const res = await request(app.getHttpServer())
        .get('/personal/access/FLAG')
        .expect(200);

      expect(res.body.target).toBe('FLAG');
      expect(res.body.group).toHaveLength(2);
    });

    test('Shouldn`t get with wrong target', async () => {
      await createAccess().withTarget(AccessTarget.FLAG);
      await createAccess().withTarget(AccessTarget.FLAG).withMethod(AccessMethod.GET);
      await createAccess().withTarget(AccessTarget.ATTRIBUTE);

      await request(app.getHttpServer())
        .get('/personal/access/WRONG')
        .expect(404);
    });
  });

  describe('Access updating', () => {
    test('Should update access', async () => {
      await createAccess()
        .withTarget(AccessTarget.DIRECTORY)
        .withMethod(AccessMethod.DELETE);

      const inst = await request(app.getHttpServer())
        .put(`/personal/access/DIRECTORY`)
        .send({
          target: 'BLOCK',
          group: [{method: 'GET'}],
        })
        // .expect(200);

      console.log(inst.body);
      // expect(inst.body).toMatchObject({
      //   target: 'BLOCK',
      //   method: 'GET',
      // });
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
