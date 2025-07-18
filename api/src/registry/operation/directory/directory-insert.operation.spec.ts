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
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('Directory addition', () => {
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

  describe('Directory addition with fields', () => {
    test('Should add item', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();

      const res = await request(app.getHttpServer())
        .post('/registry/directory')
        .send({id: 'LIST'})
        .expect(201);

      expect(res.body.id).toBe('LIST');
    });

    test('Shouldn`t add without access', async () => {
      await request(app.getHttpServer())
        .post('/registry/directory')
        .send({id: 'LIST'})
        .expect(403);
    });

    test('Shouldn`t add with blank id', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();

      await request(app.getHttpServer())
        .post('/registry/directory')
        .send({id: ''})
        .expect(400);
    });

    test('Shouldn`t add with blank id', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();

      await request(app.getHttpServer())
        .post('/registry/directory')
        .send({id: null})
        .expect(400);
    });

    test('Shouldn`t add with duplicate id', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();

      await request(app.getHttpServer())
        .post('/registry/directory')
        .send({id: 'LIST'})
        .expect(201);

      await request(app.getHttpServer())
        .post('/registry/directory')
        .send({id: 'LIST'})
        .expect(400);
    });
  });

  describe('Directory addition with access', () => {
    test('Should add item with access', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();

      const item = await request(app.getHttpServer())
        .post('/registry/directory')
        .send({
          id: 'LIST',
          permission: [{method: 'READ'}],
        })
        .expect(201);

      expect(item.body.permission).toContainEqual({method: 'READ'});
    });

    test('Should add item with group access', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();

      const item = await request(app.getHttpServer())
        .post('/registry/directory')
        .send({
          id: 'LIST',
          permission: [{method: 'READ', group: 'GROUP'}],
        })
        .expect(201);

      expect(item.body.permission).toContainEqual({method: 'READ', group: 'GROUP'});
    });

    test('Shouldn`t add item with wrong group', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();

      await request(app.getHttpServer())
        .post('/registry/directory')
        .send({
          id: 'LIST',
          permission: [{method: 'READ', group: 'WRONG'}],
        })
        .expect(400);
    });

    test('Shouldn`t add item with wrong method', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();

      await request(app.getHttpServer())
        .post('/registry/directory')
        .send({
          id: 'LIST',
          permission: [{method: 'WRONG', group: 'GROUP'}],
        })
        .expect(400);
    });
  });

  describe('Directory addition with strings', () => {
    test('Should add with string', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .post('/registry/directory')
        .send({
          id: 'LIST',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(201);

      expect(res.body.attribute).toHaveLength(1);
      expect(res.body.attribute[0].attribute).toBe('NAME');
      expect(res.body.attribute[0].string).toBe('VALUE');
    });

    test('Shouldn`t add with wrong attribute', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .post('/registry/directory')
        .send({
          id: 'LIST',
          attribute: [
            {attribute: 'WRONG', string: 'VALUE'},
          ],
        })
        .expect(400);
    });
  });

  describe('Directory additions with flags', () => {
    test('Should add with flag', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const res = await request(app.getHttpServer())
        .post('/registry/directory')
        .send({
          id: 'LIST',
          flag: ['NEW'],
        })
        .expect(201);

      expect(res.body.flag).toEqual(['NEW']);
    });

    test('Shouldn`t add with duplicate flag', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      await request(app.getHttpServer())
        .post('/registry/directory')
        .send({
          id: 'LIST',
          flag: ['NEW', 'NEW'],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong flag', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      await request(app.getHttpServer())
        .post('/registry/directory')
        .send({
          id: 'LIST',
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });
});