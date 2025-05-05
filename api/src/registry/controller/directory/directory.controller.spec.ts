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
import { GroupEntity } from '../../../personal/model/group.entity';

describe('DirectoryController', () => {
  let source;
  let app;

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule({imports: [AppModule]}).compile();
    app = moduleBuilder.createNestApplication();
    app.init();

    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  async function createDirectory(id: string, method: PermissionMethod = PermissionMethod.ALL) {
    const parent = await Object.assign(new DirectoryEntity(), {id}).save();
    await Object.assign(new Directory2permissionEntity(), {parent, method}).save();

    return parent;
  }

  describe('Directory fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get list', async () => {
      for (let i = 0; i <= 9; i++) {
        await createDirectory(`NAME_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(res.body).toHaveLength(10);
      expect(res.body[0].id).toBe('NAME_0');
      expect(res.body[9].id).toBe('NAME_9');
    });

    test('Should get single instance', async () => {
      await createDirectory('NAME');

      const res = await request(app.getHttpServer())
        .get('/directory/NAME')
        .expect(200);

      expect(res.body.id).toBe('NAME');
    });

    test('Should get with limit', async () => {
      for (let i = 0; i <= 9; i++) {
        await createDirectory(`NAME_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/directory?limit=2')
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
        .get('/directory?offset=8')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe('NAME_8');
      expect(res.body[1].id).toBe('NAME_9');
    });
  });

  describe('Directory with permission', () => {
    test('Should get with permission', async () => {
      for (let i = 0; i <= 9; i++) {
        const parent = await Object.assign(new DirectoryEntity(), {id: `NAME_${i}`}).save();
        if (i % 2) {
          await Object.assign(new Directory2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();
        }
      }

      const res = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(res.body).toHaveLength(5);
      expect(res.body[0].id).toBe('NAME_1');
    });

    test('Should get instance with READ permission', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'NAME'}).save();
      await Object.assign(new Directory2permissionEntity(), {parent, method: PermissionMethod.READ}).save();

      const res = await request(app.getHttpServer())
        .get('/directory/NAME')
        .expect(200);

      expect(res.body.id).toBe('NAME');
    });

    test('Shouldn`t get instance without permission', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .get('/directory/NAME')
        .expect(403);
    });
  });

  describe('Directory count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/directory/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get count', async () => {
      for (let i = 0; i <= 9; i++) {
        await createDirectory(`NAME_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/directory/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });

    test('Should get count with permission', async () => {
      for (let i = 0; i <= 9; i++) {
        const parent = await Object.assign(new DirectoryEntity(), {id: `NAME_${i}`}).save();
        if (i % 2) {
          await Object.assign(new Directory2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();
        }
      }

      const res = await request(app.getHttpServer())
        .get('/directory/count')
        .expect(200);

      expect(res.body).toEqual({count: 5});
    });
  });

  describe('Directory with flags', () => {
    test('Should get registry with flag', async () => {
      const parent = await createDirectory('CITY');
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Directory2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });
  });

  describe('Directory with attributes', () => {
    describe('Directory with strings', () => {
      test('Should get with strings', async () => {
        await createDirectory('CITY');
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(
          new Directory4stringEntity(),
          {parent: 'CITY', attribute: 'NAME', string: 'VALUE'},
        ).save();

        const res = await request(app.getHttpServer())
          .get('/directory')
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
          .get('/directory')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].attribute[0].lang).toBe('EN');
        expect(res.body[0].attribute[0].string).toBe('VALUE');
      });
    });

    describe('Directory with point', () => {
      test('Should get registry with point', async () => {
        const directory = await createDirectory('CITY');

        const parent = await createDirectory('STATE');
        const attribute = await Object.assign(new AttributeEntity(), {id: 'CAPITAL'}).save();
        const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        await Object.assign(new Directory4pointEntity(), {parent, attribute, point}).save();

        const list = await request(app.getHttpServer())
          .get('/directory')
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
        const res = await request(app.getHttpServer())
          .post('/directory')
          .send({id: 'LIST'})
          .expect(201);

        expect(res.body.id).toBe('LIST');
      });

      test('Shouldn`t add with blank id', async () => {
        await request(app.getHttpServer())
          .post('/directory')
          .send({id: ''})
          .expect(400);
      });

      test('Shouldn`t add with blank id', async () => {
        await request(app.getHttpServer())
          .post('/directory')
          .send({id: null})
          .expect(400);
      });

      test('Shouldn`t add with duplicate id', async () => {
        await request(app.getHttpServer())
          .post('/directory')
          .send({id: 'LIST'})
          .expect(201);

        await request(app.getHttpServer())
          .post('/directory')
          .send({id: 'LIST'})
          .expect(400);
      });
    });

    describe('Directory addition with permission', () => {
      test('Should add item with permission', async () => {
        const item = await request(app.getHttpServer())
          .post('/directory')
          .send({
            id: 'LIST',
            permission: [{method: 'READ'}],
          })
          .expect(201);

        expect(item.body.permission).toContainEqual({method: 'READ'});
      });

      test('Should add item with group permission', async () => {
        await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();
        const item = await request(app.getHttpServer())
          .post('/directory')
          .send({
            id: 'LIST',
            permission: [{method: 'READ', group: 'GROUP'}],
          })
          .expect(201);

        expect(item.body.permission).toContainEqual({method: 'READ', group: 'GROUP'});
      });

      test('Shouldn`t add item with wrong group', async () => {
        await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();
        await request(app.getHttpServer())
          .post('/directory')
          .send({
            id: 'LIST',
            permission: [{method: 'READ', group: 'WRONG'}],
          })
          .expect(400);
      });

      test('Shouldn`t add item with wrong method', async () => {
        await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();
        await request(app.getHttpServer())
          .post('/directory')
          .send({
            id: 'LIST',
            permission: [{method: 'WRONG', group: 'GROUP'}],
          })
          .expect(400);
      });
    });

    describe('Directory addition with strings', () => {
      test('Should add with string', async () => {
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const res = await request(app.getHttpServer())
          .post('/directory')
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
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await request(app.getHttpServer())
          .post('/directory')
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
        await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
        const res = await request(app.getHttpServer())
          .post('/directory')
          .send({
            id: 'LIST',
            flag: ['NEW'],
          })
          .expect(201);

        expect(res.body.flag).toEqual(['NEW']);
      });

      test('Shouldn`t add with wrong flag', async () => {
        await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
        await request(app.getHttpServer())
          .post('/directory')
          .send({
            id: 'LIST',
            flag: ['WRONG'],
          })
          .expect(400);
      });
    });
  });

  describe('Directory update', () => {
    test('Should update item', async () => {
      await createDirectory('CITY');

      const res = await request(app.getHttpServer())
        .put('/directory/CITY')
        .send({id: 'CITY', permission: [{method: 'ALL'}]})
        .expect(200);

      expect(res.body.id).toBe('CITY');
      expect(res.body.permission).toEqual([{method: 'ALL'}]);
    });

    test('Should update id', async () => {
      await createDirectory('CITY');

      const res = await request(app.getHttpServer())
        .put('/directory/CITY')
        .send({id: 'NEW', permission: [{method: 'ALL'}]})
        .expect(200);

      expect(res.body.id).toBe('NEW');
      expect(res.body.permission).toEqual([{method: 'ALL'}]);
    });

    describe('Directory update with permission', () => {
      test('Should update with permission', async () => {
        await createDirectory('CITY');

        const res = await request(app.getHttpServer())
          .put('/directory/CITY')
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

      test('Should update with only permission', async () => {
        await createDirectory('CITY');

        const res = await request(app.getHttpServer())
          .patch('/directory/CITY')
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
          .put('/directory/CITY')
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
          .put('/directory/CITY')
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
          .put('/directory/CITY')
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
          .patch('/directory/CITY')
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
          .put('/directory/CITY')
          .send({
            id: 'CITY',
            flag: ['ACTIVE'],
            permission: [{method: 'ALL'}],
          })
          .expect(200);

        const removeRes = await request(app.getHttpServer())
          .put('/directory/CITY')
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
          .put('/directory/CITY')
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
        .delete('/directory/CITY')
        .expect(200);

      expect(res.body).toEqual(['CITY']);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await createDirectory('CITY');

      await request(app.getHttpServer())
        .delete('/directory/WRONG')
        .expect(403);
    });

    test('Shouldn`t delete without permission', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      await request(app.getHttpServer())
        .delete('/directory/CITY')
        .expect(403);
    });
  });
});
