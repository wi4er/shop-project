import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { BlockEntity } from '../../model/block/block.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { Block2permissionEntity } from '../../model/block/block2permission.entity';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { AttributeEntity, AttributeType } from '../../../settings/model/attribute/attribute.entity';
import { Block4stringEntity } from '../../model/block/block4string.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { Block2flagEntity } from '../../model/block/block2flag.entity';

describe('Block updating', () => {
  let source: DataSource;
  let app: INestApplication;

  function createBlock(id?: string): Promise<BlockEntity> & any {
    const item = new BlockEntity();
    item.id = id;

    let permission = null;
    let access = null;

    const operations = {
      withSort(sort: number) {
        item.sort = sort;
        return this;
      },
      withVersion(version: number) {
        item.version = version;
        return this;
      },
      withPermission(
        method: PermissionMethod | null = PermissionMethod.ALL,
        group: string | null = null,
      ) {
        if (!permission) permission = [];
        if (method) permission.push({group, method});
        return this;
      },
      withAccess(
        method: AccessMethod = AccessMethod.ALL,
        group?: GroupEntity,
      ) {
        if (!access) access = [];
        if (method) access.push({method, group});
        return this;
      },
    };

    return Object.assign(Promise.resolve({
      then: resolve => resolve(item.save().then(async parent => {
        for (const {group, method} of permission ?? [{group: null, method: PermissionMethod.ALL}]) {
          await Object.assign(
            new Block2permissionEntity(),
            {parent, group, method},
          ).save();
        }

        for (const {group, method} of access ?? [{group: null, method: AccessMethod.ALL}]) {
          await source.getRepository(AccessEntity)
            .findOne({where: {group, method, target: AccessTarget.BLOCK}})
            .then(inst => {
              if (!inst) return Object.assign(new AccessEntity(), {
                group,
                method,
                target: AccessTarget.BLOCK,
              }).save();
            });
        }

        return parent;
      })),
    }), operations);
  }

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule({imports: [AppModule]}).compile();
    app = moduleBuilder.createNestApplication();
    await app.init();

    source = await createConnection(createConnectionOptions());
  });
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Content block field update', () => {
    test('Should update block', async () => {
      await createBlock('BLOCK');

      const inst = await request(app.getHttpServer())
        .put(`/content/block/BLOCK`)
        .send({
          id: 'BLOCK',
          sort: 345,
        })
        .expect(200);

      expect(inst.body.id).toBe('BLOCK');
      expect(inst.body.sort).toBe(345);
    });

    test('Shouldn`t update block with wrong id', async () => {
      await createBlock('BLOCK');

      await request(app.getHttpServer())
        .put(`/content/block/WRONG`)
        .send({
          id: 'BLOCK',
          sort: 345,
        })
        .expect(404);
    });

    test('Should update id', async () => {
      await createBlock('BLOCK');

      const inst = await request(app.getHttpServer())
        .put(`/content/block/BLOCK`)
        .send({id: 'UPDATE'})
        .expect(200);

      expect(inst.body.id).toBe('UPDATE');
    });

    test('Should update only id', async () => {
      await createBlock('BLOCK');

      const inst = await request(app.getHttpServer())
        .patch(`/content/block/BLOCK`)
        .send({id: 'UPDATE'})
        .expect(200);

      expect(inst.body.id).toBe('UPDATE');
      expect(inst.body.permission).toEqual([{method: 'ALL'}]);
    });
  });

  describe('Content block permission update', () => {
    test('Should update permission and read', async () => {
      await createBlock('BLOCK');

      await request(app.getHttpServer())
        .put(`/content/block/BLOCK`)
        .send({
          id: 'BLOCK',
          permission: [{method: 'READ'}],
        })
        .expect(200);

      const inst = await request(app.getHttpServer())
        .get(`/content/block/BLOCK`)
        .expect(200);

      expect(inst.body.permission).toEqual([{method: 'READ'}]);
    });

    test('Should update permissions', async () => {
      await Object.assign(new GroupEntity(), {id: '222'}).save();

      await createBlock('BLOCK')
        .withPermission(PermissionMethod.READ)
        .withPermission(PermissionMethod.ALL);

      const inst = await request(app.getHttpServer())
        .put(`/content/block/BLOCK`)
        .send({
          id: 'BLOCK',
          permission: [
            {method: 'READ'},
            {method: 'WRITE'},
            {method: 'DELETE'},
            {method: 'ALL'},
          ],
        })
        .expect(200);

      expect(inst.body.permission).toHaveLength(4);
    });
  });

  describe('Content block update with strings', () => {
    test('Should add strings', async () => {
      const parent = await createBlock();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .put(`/content/block/${parent.id}`)
        .send({
          id: parent.id,
          attribute: [
            {attribute: 'NAME', string: 'John'},
          ],
        })
        .expect(200);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute).toEqual([{attribute: 'NAME', string: 'John'}]);
    });

    test('Should remove strings', async () => {
      const parent = await createBlock('BLOCK');
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Block4stringEntity(), {attribute, parent, string: 'VALUE'}).save();

      const inst = await request(app.getHttpServer())
        .put('/content/block/BLOCK')
        .send({
          id: 'BLOCK',
          attribute: [],
        })
        .expect(200);

      expect(inst.body.attribute).toHaveLength(0);
    });
  });

  describe('Content block update with strings', () => {
    test('Should add description', async () => {
      const parent = await createBlock();
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.DESCRIPTION}).save();

      const inst = await request(app.getHttpServer())
        .put(`/content/block/${parent.id}`)
        .send({
          id: parent.id,
          attribute: [
            {attribute: 'NAME', description: 'TEXT'},
          ],
        })
        .expect(200);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute).toEqual([{attribute: 'NAME', description: 'TEXT'}]);
    });
  });

  describe('Content block update with flags', () => {
    test('Should add flags', async () => {
      await createBlock('BLOCK');
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const inst = await request(app.getHttpServer())
        .put(`/content/block/BLOCK`)
        .send({id: 'BLOCK', flag: ['NEW']})
        .expect(200);

      expect(inst.body.flag).toEqual(['NEW']);
    });

    test('Should update only flags', async () => {
      await createBlock('BLOCK');
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const inst = await request(app.getHttpServer())
        .patch(`/content/block/BLOCK`)
        .send({id: 'BLOCK', flag: ['NEW']})
        .expect(200);

      expect(inst.body.flag).toEqual(['NEW']);
    });

    test('Shouldn`t add wrong flag', async () => {
      await createBlock('BLOCK');

      await request(app.getHttpServer())
        .put(`/content/block/BLOCK`)
        .send({id: 'BLOCK', flag: ['WRONG']})
        .expect(400);
    });

    test('Shouldn`t add duplicate flags', async () => {
      await createBlock('BLOCK');
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      await request(app.getHttpServer())
        .put(`/content/block/BLOCK`)
        .send({id: 'BLOCK', flag: ['NEW', 'NEW']})
        .expect(400);
    });

    test('Should remove flags', async () => {
      const parent = await createBlock();
      const flag = await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new Block2flagEntity(), {flag, parent}).save();

      const inst = await request(app.getHttpServer())
        .put(`/content/block/${parent.id}`)
        .send({id: parent.id, flag: []})
        .expect(200);

      expect(inst.body.flag).toEqual([]);
    });
  });
});