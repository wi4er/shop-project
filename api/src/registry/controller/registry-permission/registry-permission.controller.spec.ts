import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { PermissionMethod, RegistryEntity, RegistryPermissionEntity } from '../../model/registry-permission.entity';

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
        .get('/registry/permission')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });
  });

  describe('Permission item', () => {
    test('Should get item', async () => {
      const parent = await Object.assign(
        new RegistryPermissionEntity(),
        {method: PermissionMethod.GET, entity: RegistryEntity.DIRECTORY}
      ).save();

      const res = await request(app.getHttpServer())
        .get(`/registry/permission/${parent.id}`)
        .expect(200);

      expect(res.body.id).toBe(1);
      expect(res.body.method).toBe('GET');
      expect(res.body.entity).toBe('DIRECTORY');
    });
  });
});
