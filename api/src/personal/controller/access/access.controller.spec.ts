import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { PermissionMethod, AccessEntity, AccessEntity } from '../../model/access/access.entity';

describe('Registry Permission Controller', () => {
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

  describe('Permission fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/personal/access')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });
  });

  describe('Permission item', () => {
    test('Should get item', async () => {
      const parent = await Object.assign(
        new AccessEntity(),
        {method: PermissionMethod.GET, entity: RegistryEntity.DIRECTORY}
      ).save();

      const res = await request(app.getHttpServer())
        .get(`/personal/access/${parent.id}`)
        .expect(200);

      expect(res.body.id).toBe(1);
      expect(res.body.method).toBe('GET');
      expect(res.body.entity).toBe('DIRECTORY');
    });

    test('Shouldn`t get with wrong id', async () => {
      await Object.assign(
        new AccessEntity(),
        {method: PermissionMethod.GET, entity: RegistryEntity.DIRECTORY}
      ).save();

      await request(app.getHttpServer())
        .get(`/personal/access/7777`)
        .expect(404);
    });
  });
});
