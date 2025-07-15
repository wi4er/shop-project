import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { DirectoryEntity } from '../../model/directory/directory.entity';
import { Directory2permissionEntity } from '../../model/directory/directory2permission.entity';
import * as request from 'supertest';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('Point addition', () => {
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

  async function createDirectory(id: string, method: PermissionMethod = PermissionMethod.ALL) {
    const parent = await Object.assign(new DirectoryEntity(), {id}).save();
    await Object.assign(new Directory2permissionEntity(), {parent, method}).save();

    return parent;
  }

  describe('Point addition with fields', () => {
    test('Should add point', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      const res = await request(app.getHttpServer())
        .post('/registry/point')
        .send({
          id: 'London',
          directory: 'CITY',
        })
        .expect(201);

      expect(res.body.id).toBe('London');
      expect(res.body.directory).toBe('CITY');
    });

    test('Shouldn`t add with duplicate id', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      await request(app.getHttpServer())
        .post('/registry/point')
        .send({
          id: 'London',
          directory: 'CITY',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/registry/point')
        .send({
          id: 'London',
          directory: 'CITY',
        })
        .expect(400);
    });

    test('Shouldn`t add with blank id', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      await request(app.getHttpServer())
        .post('/registry/point')
        .send({id: '', directory: 'CITY'})
        .expect(400);
    });

    test('Shouldn`t add without id', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      await request(app.getHttpServer())
        .post('/registry/point')
        .send({directory: 'CITY'})
        .expect(400);
    });

    test('Shouldn`t add without registry', async () => {
      await request(app.getHttpServer())
        .post('/registry/point')
        .send({id: 'London'})
        .expect(400);
    });

    test('Shouldn`t add with wrong registry', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      await request(app.getHttpServer())
        .post('/registry/point')
        .send({
          id: 'London',
          directory: 'WRONG',
        })
        .expect(400);
    });
  });

  describe('Point addition with flags', () => {
    test('Should add flag to point', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const res = await request(app.getHttpServer())
        .post('/registry/point')
        .send({
          id: 'London',
          directory: 'CITY',
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(res.body.flag).toEqual(['ACTIVE']);
    });

    test('Shouldn`t add with wrong flag', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .post('/registry/point')
        .send({
          id: 'London',
          directory: 'CITY',
          flag: ['WRONG'],
        })
        .expect(400);
    });

    test('Shouldn`t add with duplicate flag', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .post('/registry/point')
        .send({
          id: 'London',
          directory: 'CITY',
          flag: ['ACTIVE', 'ACTIVE'],
        })
        .expect(400);
    });
  });
});