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
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('Point update', () => {
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

  describe('Pont fields update', () => {
    test('Should update point', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const res = await request(app.getHttpServer())
        .put('/registry/point/LONDON')
        .send({
          id: 'LONDON',
          directory: 'CITY',
        })
        .expect(200);

      expect(res.body.id).toBe('LONDON');
      expect(res.body.directory).toBe('CITY');
    });

    test('Should update id', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const res = await request(app.getHttpServer())
        .put('/registry/point/LONDON')
        .send({
          id: 'UPDATED',
          directory: 'CITY',
        })
        .expect(200);

      expect(res.body.id).toBe('UPDATED');
      expect(res.body.directory).toBe('CITY');
    });

    test('Should update directory', async () => {
      const directory = await createDirectory('CITY');
      await createDirectory('LOCATION');
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const res = await request(app.getHttpServer())
        .put('/registry/point/LONDON')
        .send({
          id: 'LONDON',
          directory: 'LOCATION',
        })
        .expect(200);

      expect(res.body.id).toBe('LONDON');
      expect(res.body.directory).toBe('LOCATION');
    });

    test('Shouldn`t update with wrong directory', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await request(app.getHttpServer())
        .put('/registry/point/LONDON')
        .send({
          id: 'LONDON',
          directory: 'WRONG',
        })
        .expect(400);
    });

    test('Shouldn`t update with wrong id', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await request(app.getHttpServer())
        .put('/registry/point/WRONG')
        .send({
          id: 'London',
          directory: 'CITY',
        })
        .expect(404);
    });

    test('Shouldn`t update without access', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await request(app.getHttpServer())
        .put('/registry/point/LONDON')
        .send({
          id: 'LONDON',
          directory: 'CITY',
        })
        .expect(403);
    });
  });

  describe('Point patch update', () => {
    test('Should update registry only', async () => {
      const directory = await createDirectory('CITY');
      await createDirectory('LOCATION');
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const res = await request(app.getHttpServer())
        .patch('/registry/point/LONDON')
        .send({
          directory: 'LOCATION',
        })
        .expect(200);

      expect(res.body.directory).toBe('LOCATION');
    });


    test('Should update strings only', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const res = await request(app.getHttpServer())
        .patch('/registry/point/LONDON')
        .send({
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(200);

      expect(res.body.directory).toBe('CITY');
      expect(res.body.attribute).toHaveLength(1);
      expect(res.body.attribute).toContainEqual({attribute: 'NAME', string: 'VALUE'});
    });
  });

  describe('Point update with flags', () => {
    test('Should update point flag', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const res = await request(app.getHttpServer())
        .put('/registry/point/LONDON')
        .send({
          id: 'LONDON',
          directory: 'CITY',
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(res.body.flag).toEqual(['ACTIVE']);
    });

    test('Should update flags only', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const res = await request(app.getHttpServer())
        .patch('/registry/point/LONDON')
        .send({
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(res.body.flag).toEqual(['ACTIVE']);
    });

    test('Shouldn`t update with wrong flag', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await request(app.getHttpServer())
        .put('/registry/point/LONDON')
        .send({
          id: 'LONDON',
          directory: 'CITY',
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });
});