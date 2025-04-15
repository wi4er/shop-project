import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { BlockEntity } from '../../model/block.entity';
import { Block4stringEntity } from '../../model/block4string.entity';
import { Block2flagEntity } from '../../model/block2flag.entity';
import { DirectoryEntity } from '../../../directory/model/directory.entity';
import { PointEntity } from '../../../directory/model/point.entity';
import { Block4pointEntity } from '../../model/block4point.entity';
import { PropertyEntity } from '../../../settings/model/property.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { Block2permissionEntity } from '../../model/block2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { GroupEntity } from '../../../personal/model/group.entity';

describe('BlockController', () => {
  let source;
  let app;

  async function createBlock(): Promise<BlockEntity> {
    const parent = await new BlockEntity().save();
    await Object.assign(new Block2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();

    return parent;
  }

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule({imports: [AppModule]}).compile();
    app = moduleBuilder.createNestApplication();
    app.init();

    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Content block fields', () => {
    test('Should get empty block list', async () => {
      const list = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(list.body).toEqual([]);
    });

    test('Should get block list', async () => {
      await createBlock();

      const list = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe(1);
    });

    test('Should get block item', async () => {
      await createBlock();

      const item = await request(app.getHttpServer())
        .get('/block/1')
        .expect(200);

      expect(item.body.id).toBe(1);
      expect(item.body.created_at).toBeDefined();
      expect(item.body.updated_at).toBeDefined();
      expect(item.body.version).toBe(1);
      expect(item.body.property).toEqual([]);
      expect(item.body.flag).toEqual([]);
      expect(item.body.permission).toEqual([{method: 'ALL'}]);
    });

    test('Shouldn`t get item without permission', async () => {
      await new BlockEntity().save();

      await request(app.getHttpServer())
        .get('/block/1')
        .expect(403);
    });

    test('Should get block list with permission', async () => {
      for (let i = 0; i < 10; i++) {
        const parent = await new BlockEntity().save();
        if (i % 2) {
          await Object.assign(new Block2permissionEntity(), {parent, method: PermissionMethod.READ}).save();
        }
      }

      const list = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(list.body).toHaveLength(5);
      expect(list.body[0].id).toBe(2);
      expect(list.body[1].id).toBe(4);
      expect(list.body[2].id).toBe(6);
      expect(list.body[3].id).toBe(8);
      expect(list.body[4].id).toBe(10);
    });

    test('Should get block with limit', async () => {
      for (let i = 0; i < 10; i++) {
        const parent = await new BlockEntity().save();
        await Object.assign(new Block2permissionEntity(), {parent, method: PermissionMethod.READ}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/block?limit=4')
        .expect(200);

      expect(list.body).toHaveLength(4);
      expect(list.body[0].id).toBe(1);
      expect(list.body[1].id).toBe(2);
      expect(list.body[2].id).toBe(3);
      expect(list.body[3].id).toBe(4);
    });

    test('Should get block with offset', async () => {
      for (let i = 0; i < 10; i++) {
        const parent = await new BlockEntity().save();
        await Object.assign(new Block2permissionEntity(), {parent, method: PermissionMethod.READ}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/block?offset=5')
        .expect(200);

      expect(list.body).toHaveLength(5);
      expect(list.body[0].id).toBe(6);
      expect(list.body[1].id).toBe(7);
      expect(list.body[2].id).toBe(8);
      expect(list.body[3].id).toBe(9);
      expect(list.body[4].id).toBe(10);
    });
  });

  describe('Content block count', () => {
    test('Should get empty block count', async () => {
      const item = await request(app.getHttpServer())
        .get('/block/count')
        .expect(200);

      expect(item.body).toEqual({count: 0});
    });

    test('Should get block count', async () => {
      for (let i = 0; i < 10; i++) {
        const parent = await new BlockEntity().save();
        await Object.assign(new Block2permissionEntity(), {parent, method: PermissionMethod.READ}).save();
      }

      const item = await request(app.getHttpServer())
        .get('/block/count')
        .expect(200);

      expect(item.body).toEqual({count: 10});
    });

    test('Should get count with permission', async () => {
      for (let i = 0; i < 10; i++) {
        const parent = await new BlockEntity().save();
        if (i % 2) {
          await Object.assign(new Block2permissionEntity(), {parent, method: PermissionMethod.READ}).save();
        }
      }

      const item = await request(app.getHttpServer())
        .get('/block/count')
        .expect(200);

      expect(item.body).toEqual({count: 5});
    });
  });

  describe('Content element with strings', () => {
    test('Should get block with string', async () => {
      const parent = await createBlock();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Block4stringEntity(), {parent, property, string: 'VALUE'}).save();

      const list = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].string).toBe('VALUE');
      expect(list.body[0].property[0].property).toBe('NAME');
    });

    test('Should get block with lang', async () => {
      const parent = await createBlock();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Block4stringEntity(), {parent, property, lang, string: 'WITH_LANG'}).save();

      const list = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].string).toBe('WITH_LANG');
      expect(list.body[0].property[0].property).toBe('NAME');
      expect(list.body[0].property[0].lang).toBe('EN');
    });
  });

  describe('Content block with flags', () => {
    test('Should get block with flag', async () => {
      const parent = await createBlock();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Block2flagEntity(), {parent, flag}).save();

      const item = await request(app.getHttpServer())
        .get('/block/1')
        .expect(200);

      expect(item.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('Content element with point', () => {
    test('Should get element with point', async () => {
      const parent = await createBlock();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Block4pointEntity(), {parent, property, point}).save();

      const item = await request(app.getHttpServer())
        .get('/block/1')
        .expect(200);

      expect(item.body.property).toHaveLength(1);
      expect(item.body.property[0].point).toBe('LONDON');
      expect(item.body.property[0].directory).toBe('CITY');
    });
  });

  describe('Content block addition', () => {
    test('Should add block', async () => {
      const inst = await request(app.getHttpServer())
        .post('/block')
        .send({permission: [{method: 'READ'}]})
        .expect(201);

      expect(inst.body.id).toBe(1);
    });

    test('Should add and read', async () => {
      await request(app.getHttpServer())
        .post('/block')
        .send({permission: [{method: 'READ'}]})
        .expect(201);

      const inst = await request(app.getHttpServer())
        .get('/block/1')
        .expect(200);

      expect(inst.body.id).toBe(1);
    });

    test('Should add with strings', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/block')
        .send({
          property: [
            {property: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(201);

      expect(inst.body.property).toHaveLength(1);
      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].string).toBe('VALUE');
    });
  });

  describe('Content block addition with point', () => {
    test('Should add with point', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'London', directory}).save();
      await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();

      const inst = await request(app.getHttpServer())
        .post('/block')
        .send({
          property: [
            {property: 'CURRENT', point: 'London'},
          ],
        })
        .expect(201);

      expect(inst.body.property).toHaveLength(1);
      expect(inst.body.property[0].property).toBe('CURRENT');
      expect(inst.body.property[0].point).toBe('London');
      expect(inst.body.property[0].directory).toBe('CITY');
    });

    test('Shouldn`t add with wrong point', async () => {
      await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();

      await request(app.getHttpServer())
        .post('/block')
        .send({
          property: [
            {property: 'CURRENT', point: 'WRONG'},
          ],
        })
        .expect(400);
    });

    test('Shouldn`t add with blank point', async () => {
      await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();

      const inst = await request(app.getHttpServer())
        .post('/block')
        .send({
          property: [
            {property: 'CURRENT'},
          ],
        })
        .expect(400);
    });
  });

  describe('Content block addition with flag', () => {
    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .post('/block')
        .send({
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });

    test('Shouldn`t add with wrong flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .post('/block')
        .send({
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });

  describe('Content block update', () => {
    test('Should add block', async () => {
      const parent = await createBlock();

      const inst = await request(app.getHttpServer())
        .put(`/block/${parent.id}`)
        .send({})
        .expect(200);

      expect(inst.body.id).toBe(1);
    });

    test('Should update permission and read', async () => {
      const parent = await createBlock();

      await request(app.getHttpServer())
        .put(`/block/${parent.id}`)
        .send({
          permission: [{method: 'READ'}]
        })
        .expect(200);

      const inst = await request(app.getHttpServer())
        .get(`/block/${parent.id}`)
        .expect(200);

      expect(inst.body.permission).toEqual([{method: 'READ'}]);
    });
  });

  describe('Content block update with strings', () => {
    test('Should add strings', async () => {
      const parent = await createBlock();
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .put(`/block/${parent.id}`)
        .send({
          property: [
            {property: 'NAME', string: 'John'},
          ],
        })
        .expect(200);

      expect(inst.body.property).toHaveLength(1);
      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].string).toBe('John');
    });

    test('Should remove strings', async () => {
      const parent = await createBlock();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Block4stringEntity(), {property, parent, string: 'VALUE'}).save();

      const inst = await request(app.getHttpServer())
        .put('/block/1')
        .send({
          property: [],
        })
        .expect(200);

      expect(inst.body.property).toHaveLength(0);
    });
  });

  describe('Content block update with flags', () => {
    test('Should add flags', async () => {
      const parent = await createBlock();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const inst = await request(app.getHttpServer())
        .put(`/block/${parent.id}`)
        .send({flag: ['NEW']})
        .expect(200);

      expect(inst.body.flag).toEqual(['NEW']);
    });

    test('Should update only flags', async () => {
      const parent = await createBlock();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const inst = await request(app.getHttpServer())
        .patch(`/block/${parent.id}`)
        .send({flag: ['NEW']})
        .expect(200);

      expect(inst.body.flag).toEqual(['NEW']);
    });

    test('Shouldn`t add wrong flag', async () => {
      const parent = await createBlock();

      await request(app.getHttpServer())
        .put(`/block/${parent.id}`)
        .send({flag: ['WRONG']})
        .expect(400);
    });

    test('Should remove flags', async () => {
      const parent = await createBlock();
      const flag = await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new Block2flagEntity(), {flag, parent}).save();

      const inst = await request(app.getHttpServer())
        .put(`/block/${parent.id}`)
        .send({flag: []})
        .expect(200);

      expect(inst.body.flag).toEqual([]);
    });
  });

  describe('Content block update with permission', () => {
    test('Should update permissions', async () => {
      await Object.assign(new GroupEntity(), {id: '222'}).save();

      const parent = await new BlockEntity().save();
      await Object.assign(new Block2permissionEntity(), {parent, method: PermissionMethod.READ}).save();
      await Object.assign(new Block2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .put(`/block/${parent.id}`)
        .send({
          permission: [
            {method: 'READ'},
            {method: 'WRITE'},
            {method: 'DELETE'},
            {method: 'ALL'},
          ]
        })
        .expect(200);

      expect(inst.body.permission).toHaveLength(4);
    });
  });

  describe('Content block deletion', () => {
    test('Should delete block', async () => {
      const parent = await createBlock();

      const inst = await request(app.getHttpServer())
        .delete(`/block/${parent.id}`)
        .expect(200);

      expect(inst.body).toEqual([1]);
    });

    test('Shouldn`t delete without permission', async () => {
      const parent = await new BlockEntity().save();

      await request(app.getHttpServer())
        .delete(`/block/${parent.id}`)
        .expect(403);
    });

    test('Shouldn`t delete without DELETE permission', async () => {
      const parent = await new BlockEntity().save();
      await Object.assign(new Block2permissionEntity(), {parent, method: PermissionMethod.READ}).save();
      await Object.assign(new Block2permissionEntity(), {parent, method: PermissionMethod.WRITE}).save();

      await request(app.getHttpServer())
        .delete(`/block/${parent.id}`)
        .expect(403);
    });
  });
});
