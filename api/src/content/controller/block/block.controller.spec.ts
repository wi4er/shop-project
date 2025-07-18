import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { BlockEntity } from '../../model/block/block.entity';
import { Block4stringEntity } from '../../model/block/block4string.entity';
import { Block2flagEntity } from '../../model/block/block2flag.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { Block4pointEntity } from '../../model/block/block4point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { Block2permissionEntity } from '../../model/block/block2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { Block4descriptionEntity } from '../../model/block/block4description.entity';

describe('Block Controller', () => {
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

  describe('Content block list', () => {
    test('Should get empty block list', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.BLOCK, method: AccessMethod.GET}).save();

      const list = await request(app.getHttpServer())
        .get('/content/block')
        .expect(200);

      expect(list.body).toEqual([]);
    });

    test('Shouldn`t get without access', async () => {
      await request(app.getHttpServer())
        .get('/content/block')
        .expect(403);
    });

    test('Should get block list', async () => {
      await createBlock('BLOCK');

      const list = await request(app.getHttpServer())
        .get('/content/block')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe('BLOCK');
    });

    test('Should get block list with permission', async () => {
      for (let i = 0; i < 10; i++) {
        await createBlock(`BLOCK_${i}`).withPermission(i % 2 ? PermissionMethod.READ : null);
      }

      const list = await request(app.getHttpServer())
        .get('/content/block')
        .expect(200);

      expect(list.body).toHaveLength(5);
      expect(list.body[0].id).toBe('BLOCK_9');
      expect(list.body[1].id).toBe('BLOCK_7');
      expect(list.body[2].id).toBe('BLOCK_5');
      expect(list.body[3].id).toBe('BLOCK_3');
      expect(list.body[4].id).toBe('BLOCK_1');
    });

    test('Should get block with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await createBlock(`BLOCK_${i}`);
      }

      const list = await request(app.getHttpServer())
        .get('/content/block?limit=4')
        .expect(200);

      expect(list.body).toHaveLength(4);
      expect(list.body[0].id).toBe('BLOCK_9');
      expect(list.body[1].id).toBe('BLOCK_8');
      expect(list.body[2].id).toBe('BLOCK_7');
      expect(list.body[3].id).toBe('BLOCK_6');
    });

    test('Should get block with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await createBlock(`BLOCK_${i}`);
      }

      const list = await request(app.getHttpServer())
        .get('/content/block?offset=5')
        .expect(200);

      expect(list.body).toHaveLength(5);
      expect(list.body[0].id).toBe('BLOCK_4');
      expect(list.body[1].id).toBe('BLOCK_3');
      expect(list.body[2].id).toBe('BLOCK_2');
      expect(list.body[3].id).toBe('BLOCK_1');
      expect(list.body[4].id).toBe('BLOCK_0');
    });
  });

  describe('Content block item', () => {
    test('Should get block item', async () => {
      await createBlock('BLOCK');

      const item = await request(app.getHttpServer())
        .get('/content/block/BLOCK')
        .expect(200);

      expect(item.body.id).toBe('BLOCK');
      expect(item.body.sort).toBe(100);
      expect(item.body.created_at).toBeDefined();
      expect(item.body.updated_at).toBeDefined();
      expect(item.body.version).toBe(1);
      expect(item.body.attribute).toEqual([]);
      expect(item.body.flag).toEqual([]);
      expect(item.body.permission).toEqual([{method: 'ALL'}]);
    });

    test('Shouldn`t get with wrong id', async () => {
      await createBlock('BLOCK');

      await request(app.getHttpServer())
        .get('/content/block/WRONG')
        .expect(404);
    });

    test('Shouldn`t get item without permission', async () => {
      await createBlock('BLOCK').withPermission(null);

      await request(app.getHttpServer())
        .get('/content/block/BLOCK')
        .expect(403);
    });

    test('Shouldn`t get item without access', async () => {
      await createBlock('BLOCK').withAccess(null);

      await request(app.getHttpServer())
        .get('/content/block/BLOCK')
        .expect(403);
    });
  });

  describe('Content block count', () => {
    test('Should get empty block count', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();

      const item = await request(app.getHttpServer())
        .get('/content/block/count')
        .expect(200);

      expect(item.body).toEqual({count: 0});
    });

    test('Should get block count', async () => {
      for (let i = 0; i < 10; i++) {
        await createBlock(`BLOCK${i}`);
      }

      const item = await request(app.getHttpServer())
        .get('/content/block/count')
        .expect(200);

      expect(item.body).toEqual({count: 10});
    });

    test('Should get count with access', async () => {
      for (let i = 0; i < 10; i++) {
        await createBlock().withPermission(i % 2 ? PermissionMethod.READ : null);
      }

      const item = await request(app.getHttpServer())
        .get('/content/block/count')
        .expect(200);

      expect(item.body).toEqual({count: 5});
    });
  });

  describe('Content block with attributes', () => {
    describe('Content element with strings', () => {
      test('Should get block with string', async () => {
        const parent = await createBlock('BLOCK');
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new Block4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

        const list = await request(app.getHttpServer())
          .get('/content/block')
          .expect(200);

        expect(list.body).toHaveLength(1);
        expect(list.body[0].id).toBe('BLOCK');
        expect(list.body[0].attribute).toEqual([{string: 'VALUE', attribute: 'NAME'}]);
      });

      test('Should get block with lang', async () => {
        const parent = await createBlock('BLOCK');
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
        await Object.assign(new Block4stringEntity(), {parent, attribute, lang, string: 'WITH_LANG'}).save();

        const list = await request(app.getHttpServer())
          .get('/content/block')
          .expect(200);

        expect(list.body).toHaveLength(1);
        expect(list.body[0].id).toBe('BLOCK');
        expect(list.body[0].attribute).toEqual([{string: 'WITH_LANG', attribute: 'NAME', lang: 'EN'}]);
      });
    });

    describe('Content element with descriptions', () => {
      test('Should get block with description', async () => {
        const parent = await createBlock('BLOCK');
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new Block4descriptionEntity(), {parent, attribute, description: 'TEXT'}).save();

        const list = await request(app.getHttpServer())
          .get('/content/block')
          .expect(200);

        expect(list.body).toHaveLength(1);
        expect(list.body[0].id).toBe('BLOCK');
        expect(list.body[0].attribute).toEqual([{description: 'TEXT', attribute: 'NAME'}]);
      });

      test('Should get block with lang description', async () => {
        const parent = await createBlock('BLOCK');
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
        await Object.assign(new Block4descriptionEntity(), {parent, attribute, lang, description: 'WITH_LANG'}).save();

        const list = await request(app.getHttpServer())
          .get('/content/block')
          .expect(200);

        expect(list.body).toHaveLength(1);
        expect(list.body[0].id).toBe('BLOCK');
        expect(list.body[0].attribute).toEqual([{description: 'WITH_LANG', attribute: 'NAME', lang: 'EN'}]);
      });
    });

    describe('Content element with point', () => {
      test('Should get element with point', async () => {
        const parent = await createBlock('BLOCK');
        const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        await Object.assign(new Block4pointEntity(), {parent, attribute, point}).save();

        const item = await request(app.getHttpServer())
          .get('/content/block/BLOCK')
          .expect(200);

        expect(item.body.attribute).toHaveLength(1);
        expect(item.body.attribute[0].point).toBe('LONDON');
        expect(item.body.attribute[0].directory).toBe('CITY');
      });
    });
  });

  describe('Content block with flags', () => {
    test('Should get block with flag', async () => {
      const parent = await createBlock('BLOCK');
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Block2flagEntity(), {parent, flag}).save();

      const item = await request(app.getHttpServer())
        .get('/content/block/BLOCK')
        .expect(200);

      expect(item.body.flag).toEqual(['ACTIVE']);
    });

    test('Should get with flag list', async () => {
      const parent = await createBlock('BLOCK');
      await Object.assign(new Block2flagEntity(), {
        parent,
        flag: await Object.assign(new FlagEntity(), {id: 'FLAG_1'}).save(),
      }).save();
      await Object.assign(new Block2flagEntity(), {
        parent,
        flag: await Object.assign(new FlagEntity(), {id: 'FLAG_2'}).save(),
      }).save();
      await Object.assign(new Block2flagEntity(), {
        parent,
        flag: await Object.assign(new FlagEntity(), {id: 'FLAG_3'}).save(),
      }).save();

      const item = await request(app.getHttpServer())
        .get('/content/block/BLOCK')
        .expect(200);

      expect(item.body.flag).toEqual(['FLAG_1', 'FLAG_2', 'FLAG_3']);
    });
  });
});
