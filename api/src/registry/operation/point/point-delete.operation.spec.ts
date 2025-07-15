import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { DirectoryEntity } from '../../model/directory/directory.entity';
import { Directory2permissionEntity } from '../../model/directory/directory2permission.entity';
import { PointEntity } from '../../model/point/point.entity';
import * as request from 'supertest';

describe('Point deletion', () => {
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

  describe('Point deletion', () => {
    test('Should delete point', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const list = await request(app.getHttpServer())
        .delete('/registry/point/LONDON')
        .expect(200);

      expect(list.body).toEqual(['LONDON']);
    });

    test('Shouldn`t  delete with wrong id', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await request(app.getHttpServer())
        .delete('/registry/point/WRONG')
        .expect(404);
    });

    test('Shouldn`t delete without access', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await request(app.getHttpServer())
        .delete('/registry/point/LONDON')
        .expect(403);
    });
  });
});