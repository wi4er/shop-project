import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { DirectoryEntity } from '../../model/directory/directory.entity';
import { Directory2permissionEntity } from '../../model/directory/directory2permission.entity';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { AccessTarget } from '../../../personal/model/access/access-target';
import * as request from 'supertest';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

describe('Directory updating', () => {
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

  async function createDirectory(
    id: string,
    method: PermissionMethod = PermissionMethod.ALL,
    permission: boolean = true,
  ) {
    const parent = await Object.assign(new DirectoryEntity(), {id}).save();
    if (permission) await Object.assign(new Directory2permissionEntity(), {parent, method}).save();
    await source.getRepository(AccessEntity).findOne({
      where: {
        method: AccessMethod.ALL,
        target: AccessTarget.DIRECTORY,
      },
    })
      .then(inst => {
        if (!inst) return Object.assign(new AccessEntity(), {
          method: AccessMethod.ALL,
          target: AccessTarget.DIRECTORY,
        }).save();
      });

    return parent;
  }

  describe('Directory update with properties', () => {
    test('Should update item', async () => {
      await createDirectory('CITY');

      const res = await request(app.getHttpServer())
        .put('/registry/directory/CITY')
        .send({id: 'CITY', permission: [{method: 'ALL'}]})
        .expect(200);

      expect(res.body.id).toBe('CITY');
      expect(res.body.permission).toEqual([{method: 'ALL'}]);
    });

    test('Shouldn`t update without access', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new Directory2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.DELETE, target: AccessTarget.DIRECTORY}).save();

      await request(app.getHttpServer())
        .put('/registry/directory/CITY')
        .send({id: 'CITY', permission: [{method: 'ALL'}]})
        .expect(403);
    });

    test('Shouldn`t update without READ access', async () => {
      await createDirectory('CITY', PermissionMethod.ALL, false);

      await request(app.getHttpServer())
        .put('/registry/directory/CITY')
        .send({id: 'CITY', permission: [{method: 'ALL'}]})
        .expect(403);
    });

    test('Should update id', async () => {
      await createDirectory('CITY');

      const res = await request(app.getHttpServer())
        .put('/registry/directory/CITY')
        .send({id: 'NEW', permission: [{method: 'ALL'}]})
        .expect(200);

      expect(res.body.id).toBe('NEW');
      expect(res.body.permission).toEqual([{method: 'ALL'}]);
    });

    test('Shouldn`t update with wrong id', async () => {
      await createDirectory('CITY');

      await request(app.getHttpServer())
        .put('/registry/directory/WRONG')
        .send({id: 'WRONG', permission: [{method: 'ALL'}]})
        .expect(404);
    });

    test('Should update only id', async () => {
      await createDirectory('CITY');

      const res = await request(app.getHttpServer())
        .patch('/registry/directory/CITY')
        .send({id: 'NEW'})
        .expect(200);

      expect(res.body.id).toBe('NEW');
      expect(res.body.permission).toEqual([{method: 'ALL'}]);
    });

    test('Shouldn`t update only id without access', async () => {
      await createDirectory('CITY', PermissionMethod.ALL, false);

      await request(app.getHttpServer())
        .patch('/registry/directory/CITY')
        .send({id: 'NEW'})
        .expect(403);
    });

    test('Shouldn`t update with wrong only id', async () => {
      await createDirectory('CITY');

      await request(app.getHttpServer())
        .patch('/registry/directory/WRONG')
        .send({id: 'UPDATE'})
        .expect(404);
    });
  });

  describe('Directory update with access', () => {
    test('Should update with access', async () => {
      await createDirectory('CITY');

      const res = await request(app.getHttpServer())
        .put('/registry/directory/CITY')
        .send({
          id: 'NEW',
          permission: [
            {method: 'READ'},
            {method: 'WRITE'},
          ],
        })
        .expect(200);

      expect(res.body.permission).toHaveLength(2);
      expect(res.body.id).toBe('NEW');
      expect(res.body.permission).toContainEqual({method: 'READ'});
      expect(res.body.permission).toContainEqual({method: 'WRITE'});
    });

    test('Should update with only access', async () => {
      await createDirectory('CITY');

      const res = await request(app.getHttpServer())
        .patch('/registry/directory/CITY')
        .send({
          permission: [
            {method: 'READ'},
            {method: 'WRITE'},
          ],
        })
        .expect(200);

      expect(res.body.permission).toHaveLength(2);
      expect(res.body.permission).toContainEqual({method: 'READ'});
      expect(res.body.permission).toContainEqual({method: 'WRITE'});
    });
  });

  describe('Directory update with strings', () => {
    test('Should add strings', async () => {
      await createDirectory('CITY');
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .put('/registry/directory/CITY')
        .send({
          id: 'CITY',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
          permission: [{method: 'ALL'}],
        })
        .expect(200);

      expect(res.body.id).toBe('CITY');
      expect(res.body.attribute[0].attribute).toBe('NAME');
      expect(res.body.attribute[0].string).toBe('VALUE');
    });

    test('Shouldn`t add with wrong attribute', async () => {
      await createDirectory('CITY');
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .put('/registry/directory/CITY')
        .send({
          id: 'CITY',
          attribute: [
            {attribute: 'WRONG', string: 'VALUE'},
          ],
          permission: [{method: 'ALL'}],
        })
        .expect(400);
    });
  });

  describe('Directory update with flags', () => {
    test('Should add flags', async () => {
      await createDirectory('CITY');
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const res = await request(app.getHttpServer())
        .put('/registry/directory/CITY')
        .send({
          id: 'CITY',
          flag: ['ACTIVE'],
          permission: [{method: 'ALL'}],
        })
        .expect(200);

      expect(res.body.flag).toEqual(['ACTIVE']);
    });

    test('Should update only flags', async () => {
      await createDirectory('CITY');
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const res = await request(app.getHttpServer())
        .patch('/registry/directory/CITY')
        .send({
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(res.body.flag).toEqual(['ACTIVE']);
    });

    test('Should add and remove flag', async () => {
      await createDirectory('CITY');
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const addRes = await request(app.getHttpServer())
        .put('/registry/directory/CITY')
        .send({
          id: 'CITY',
          flag: ['ACTIVE'],
          permission: [{method: 'ALL'}],
        })
        .expect(200);

      const removeRes = await request(app.getHttpServer())
        .put('/registry/directory/CITY')
        .send({
          id: 'CITY',
          flag: [],
          permission: [{method: 'ALL'}],
        })
        .expect(200);

      expect(addRes.body.flag).toEqual(['ACTIVE']);
      expect(removeRes.body.flag).toEqual([]);
    });

    test('Shouldn`t update with wrong flag', async () => {
      await createDirectory('CITY');
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .put('/registry/directory/CITY')
        .send({
          id: 'CITY',
          flag: ['WRONG'],
          permission: [{method: 'ALL'}],
        })
        .expect(400);
    });
  });
});