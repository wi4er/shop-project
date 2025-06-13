import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { DirectoryEntity } from '../../model/directory.entity';
import { Directory4stringEntity } from '../../model/directory4string.entity';
import { Directory2flagEntity } from '../../model/directory2flag.entity';
import { PointEntity } from '../../model/point.entity';
import { Directory4pointEntity } from '../../model/directory4point.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { Directory2permissionEntity } from '../../model/directory2permission.entity';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { AccessTarget } from '../../../personal/model/access/access-target';

describe('DirectoryController', () => {
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

  describe('Directory list', () => {
    test('Should get empty list', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.DIRECTORY}).save();

      const res = await request(app.getHttpServer())
        .get('/registry/directory')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Shouldn`t get without access', async () => {
      await request(app.getHttpServer())
        .get('/registry/directory')
        .expect(403);
    });

    test('Should get list', async () => {
      for (let i = 0; i <= 9; i++) {
        await createDirectory(`NAME_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/registry/directory')
        .expect(200);

      expect(res.body).toHaveLength(10);
      expect(res.body[0].id).toBe('NAME_0');
      expect(res.body[9].id).toBe('NAME_9');
    });

    test('Should get with limit', async () => {
      for (let i = 0; i <= 9; i++) {
        await createDirectory(`NAME_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/registry/directory?limit=2')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe('NAME_0');
      expect(res.body[1].id).toBe('NAME_1');
    });

    test('Should get with offset', async () => {
      for (let i = 0; i <= 9; i++) {
        await createDirectory(`NAME_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/registry/directory?offset=8')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe('NAME_8');
      expect(res.body[1].id).toBe('NAME_9');
    });
  });

  describe('Directory item', () => {
    test('Should get single instance', async () => {
      await createDirectory('NAME');

      const res = await request(app.getHttpServer())
        .get('/registry/directory/NAME')
        .expect(200);

      expect(res.body.id).toBe('NAME');
    });

    test('Shouldn`t get with wrong id', async () => {
      await createDirectory('NAME');

      await request(app.getHttpServer())
        .get('/registry/directory/WRONG')
        .expect(404);
    });

    test('Shouldn`t get without access', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'NAME'}).save();
      await Object.assign(new Directory2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();

      await request(app.getHttpServer())
        .get('/registry/directory/NAME')
        .expect(403);
    });

    test('Shouldn`t get without item access', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'NAME'}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.DIRECTORY}).save();

      await request(app.getHttpServer())
        .get('/registry/directory/NAME')
        .expect(403);
    });
  });

  describe('Directory with access', () => {
    test('Should get with item access', async () => {
      for (let i = 0; i <= 9; i++) {
        await createDirectory(`NAME_${i}`, PermissionMethod.ALL, i % 2 === 1);
      }

      const res = await request(app.getHttpServer())
        .get('/registry/directory')
        .expect(200);

      expect(res.body).toHaveLength(5);
      expect(res.body[0].id).toBe('NAME_1');
    });

    test('Should get with item access', async () => {
      for (let i = 0; i <= 9; i++) {
        await createDirectory(`NAME_${i}`, PermissionMethod.ALL, i % 2 === 1);
      }

      const res = await request(app.getHttpServer())
        .get('/registry/directory')
        .expect(200);

      expect(res.body).toHaveLength(5);
      expect(res.body[0].id).toBe('NAME_1');
    });

    test('Should get instance with READ access', async () => {
      await createDirectory('NAME', PermissionMethod.READ);

      const res = await request(app.getHttpServer())
        .get('/registry/directory/NAME')
        .expect(200);

      expect(res.body.id).toBe('NAME');
    });

    test('Shouldn`t get instance without item access', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new DirectoryEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .get('/registry/directory/NAME')
        .expect(403);
    });
  });

  describe('Directory count', () => {
    test('Should get empty count', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.DIRECTORY}).save();

      const res = await request(app.getHttpServer())
        .get('/registry/directory/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Shouldn`t get without access', async () => {
      await request(app.getHttpServer())
        .get('/registry/directory/count')
        .expect(403);
    });

    test('Should get count', async () => {
      for (let i = 0; i <= 9; i++) {
        await createDirectory(`NAME_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/registry/directory/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });

    test('Should get count with access', async () => {
      for (let i = 0; i <= 9; i++) {
        await createDirectory(`NAME_${i}`, PermissionMethod.ALL, i % 2 === 1);
      }

      const res = await request(app.getHttpServer())
        .get('/registry/directory/count')
        .expect(200);

      expect(res.body).toEqual({count: 5});
    });
  });

  describe('Directory with flags', () => {
    test('Should get directory with flag', async () => {
      const parent = await createDirectory('CITY');
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Directory2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/registry/directory')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });

    test('Should get directory with multiple flags', async () => {
      const parent = await createDirectory('CITY');
      const flag_1 = await Object.assign(new FlagEntity(), {id: 'FLAG_1'}).save();
      const flag_2 = await Object.assign(new FlagEntity(), {id: 'FLAG_2'}).save();
      const flag_3 = await Object.assign(new FlagEntity(), {id: 'FLAG_3'}).save();
      await Object.assign(new Directory2flagEntity(), {parent, flag: flag_1}).save();
      await Object.assign(new Directory2flagEntity(), {parent, flag: flag_2}).save();
      await Object.assign(new Directory2flagEntity(), {parent, flag: flag_3}).save();

      const list = await request(app.getHttpServer())
        .get('/registry/directory')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG_1', 'FLAG_2', 'FLAG_3']);
    });
  });

  describe('Directory with attributes', () => {
    describe('DirectoryEntity with strings', () => {
      test('Should get with strings', async () => {
        await createDirectory('CITY');
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(
          new Directory4stringEntity(),
          {parent: 'CITY', attribute: 'NAME', string: 'VALUE'},
        ).save();

        const res = await request(app.getHttpServer())
          .get('/registry/directory')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe('CITY');
        expect(res.body[0].attribute).toHaveLength(1);
        expect(res.body[0].attribute[0].attribute).toBe('NAME');
        expect(res.body[0].attribute[0].lang).toBeUndefined();
        expect(res.body[0].attribute[0].string).toBe('VALUE');
      });

      test('Should get registry with lang strings', async () => {
        await createDirectory('CITY');
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new LangEntity(), {id: 'EN'}).save();
        await Object.assign(
          new Directory4stringEntity(),
          {parent: 'CITY', attribute: 'NAME', lang: 'EN', string: 'VALUE'},
        ).save();

        const res = await request(app.getHttpServer())
          .get('/registry/directory')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].attribute[0].lang).toBe('EN');
        expect(res.body[0].attribute[0].string).toBe('VALUE');
      });
    });

    describe('DirectoryEntity with point', () => {
      test('Should get registry with point', async () => {
        const directory = await createDirectory('CITY');

        const parent = await createDirectory('STATE');
        const attribute = await Object.assign(new AttributeEntity(), {id: 'CAPITAL'}).save();
        const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        await Object.assign(new Directory4pointEntity(), {parent, attribute, point}).save();

        const list = await request(app.getHttpServer())
          .get('/registry/directory')
          .expect(200);

        expect(list.body).toHaveLength(2);
        expect(list.body[1].attribute).toHaveLength(1);
        expect(list.body[1].attribute[0].point).toBe('LONDON');
        expect(list.body[1].attribute[0].directory).toBe('CITY');
      });
    });
  });

  describe('Directory addition', () => {
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

  describe('Directory update', () => {
    describe('Directory update with fields', () => {
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

  describe('Directory deletion', () => {
    test('Should delete item', async () => {
      await createDirectory('CITY');

      const res = await request(app.getHttpServer())
        .delete('/registry/directory/CITY')
        .expect(200);

      expect(res.body).toEqual(['CITY']);
    });

    test('Shouldn`t delete without access', async () => {
      await createDirectory('CITY', PermissionMethod.ALL, false);

      await request(app.getHttpServer())
        .delete('/registry/directory/CITY')
        .expect(403);
    });

    test('Shouldn`t delete without DELETE access', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new Directory2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.PUT, target: AccessTarget.DIRECTORY}).save();

      await request(app.getHttpServer())
        .delete('/registry/directory/CITY')
        .expect(403);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await createDirectory('CITY');

      await request(app.getHttpServer())
        .delete('/registry/directory/WRONG')
        .expect(404);
    });

    test('Shouldn`t delete without access]', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.DIRECTORY}).save();

      await request(app.getHttpServer())
        .delete('/registry/directory/CITY')
        .expect(403);
    });
  });
});
