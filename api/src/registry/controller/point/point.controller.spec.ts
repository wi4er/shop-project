import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DirectoryEntity } from '../../model/directory/directory.entity';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { PointEntity } from '../../model/point/point.entity';
import { Point4stringEntity } from '../../model/point/point4string.entity';
import { Point2flagEntity } from '../../model/point/point2flag.entity';
import { Point4pointEntity } from '../../model/point/point4point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { Directory2permissionEntity } from '../../model/directory/directory2permission.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('Point Controller', () => {
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

  describe('Point fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/registry/point')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get point list', async () => {
      const directory = await createDirectory('NAME');
      await Object.assign(new PointEntity(), {id: 'NAME', directory}).save();

      const res = await request(app.getHttpServer())
        .get('/registry/point')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('NAME');
    });

    test('Should get list without access', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'London', directory}).save();

      const res = await request(app.getHttpServer())
        .get('/registry/point')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get point with limit', async () => {
      const directory = await createDirectory('NAME');

      for (let i = 0; i < 10; i++) {
        await Object.assign(new PointEntity(), {id: `NAME_${i}`, directory}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/registry/point?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('NAME_0');
      expect(res.body[1].id).toBe('NAME_1');
      expect(res.body[2].id).toBe('NAME_2');
    });

    test('Should get point with offset', async () => {
      const directory = await createDirectory('NAME');

      for (let i = 0; i < 10; i++) {
        await Object.assign(new PointEntity(), {id: `NAME_${i}`, directory}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/registry/point?offset=3')
        .expect(200);

      expect(res.body).toHaveLength(7);
      expect(res.body[0].id).toBe('NAME_3');
      expect(res.body[6].id).toBe('NAME_9');
    });
  });

  describe('Point item', () => {
    test('Should get point item', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const item = await request(app.getHttpServer())
        .get('/registry/point/LONDON')
        .expect(200);

      expect(item.body.id).toBe('LONDON');
    });

    test('Shouldn`t get with wrong id', async () => {
      const directory = await createDirectory('CITY');
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await request(app.getHttpServer())
        .get('/registry/point/WRONG')
        .expect(404);
    });

    test('Shouldn`t get point without access item', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await request(app.getHttpServer())
        .get('/registry/point/LONDON')
        .expect(403);
    });
  });

  describe('Point count', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/registry/point/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get list', async () => {
      const directory = await createDirectory('CITY');

      for (let i = 0; i < 10; i++) {
        await Object.assign(new PointEntity(), {id: `NAME_${i}`, directory}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/registry/point/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });

    test('Should get empty list without access', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'London', directory}).save();

      const res = await request(app.getHttpServer())
        .get('/registry/point/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });
  });

  describe('Point with flags', () => {
    test('Should get point with flag', async () => {
      const directory = await createDirectory('CITY');
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Point2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/registry/point')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });
  });

  describe('Point with attributes', () => {
    describe('Point with strings', () => {
      test('Should get with strings', async () => {
        const directory = await createDirectory('CITY');
        const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new Point4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

        const res = await request(app.getHttpServer())
          .get('/registry/point')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe('LONDON');
        expect(res.body[0].attribute).toHaveLength(1);
        expect(res.body[0].attribute[0].attribute).toBe('NAME');
        expect(res.body[0].attribute[0].lang).toBeUndefined();
        expect(res.body[0].attribute[0].string).toBe('VALUE');
      });

      test('Should get point with lang strings', async () => {
        const directory = await createDirectory('CITY');
        const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
        await Object.assign(new Point4stringEntity(), {parent, attribute, lang, string: 'VALUE'}).save();

        const res = await request(app.getHttpServer())
          .get('/registry/point')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].attribute[0].lang).toBe('EN');
        expect(res.body[0].attribute[0].string).toBe('VALUE');
      });
    });

    describe('Point with point', () => {
      test('Should get point with point', async () => {
        const directory = await createDirectory('CITY');
        const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
        const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'RULES'}).save();

        await Object.assign(new Point4pointEntity(), {parent, attribute, point}).save();

        const list = await request(app.getHttpServer())
          .get('/registry/point')
          .expect(200);

        expect(list.body).toHaveLength(2);
        expect(list.body[0].id).toBe('LONDON');
        expect(list.body[0].attribute).toHaveLength(1);
        expect(list.body[0].attribute[0].point).toBe('PARIS');
        expect(list.body[0].attribute[0].directory).toBe('CITY');
      });
    });
  });
});
