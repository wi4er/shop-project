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
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('Block addition', () => {
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

  describe('Content block addition with fields', () => {
    test('Should add block', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.BLOCK}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/block')
        .send({permission: [{method: 'READ'}]})
        .expect(201);

      expect(inst.body.id).toHaveLength(36);
      expect(inst.body.permission).toEqual([{method: 'READ'}]);
    });

    test('Shouldn`t add block without access', async () => {
      await request(app.getHttpServer())
        .post('/content/block')
        .send({})
        .expect(403);
    });

    test('Should add with sort', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.BLOCK}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/block')
        .send({
          id: 'BLOCK',
          sort: 333,
        })
        .expect(201);

      expect(inst.body.id).toBe('BLOCK');
      expect(inst.body.sort).toBe(333);
    });

    test('Should add and read', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();

      await request(app.getHttpServer())
        .post('/content/block')
        .send({
          id: 'BLOCK',
          permission: [{method: 'READ'}],
          sort: 444,
        })
        .expect(201);

      const inst = await request(app.getHttpServer())
        .get('/content/block/BLOCK')
        .expect(200);

      expect(inst.body.id).toBe('BLOCK');
      expect(inst.body.sort).toBe(444);
    });
  });

  describe('Content block addition with strings', () => {
    test('Should add with strings', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/block')
        .send({
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Should add with lang', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/block')
        .send({
          attribute: [
            {attribute: 'NAME', string: 'VALUE', lang: 'EN'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
      expect(inst.body.attribute[0].lang).toBe('EN');
    });

    test('Shouldn`t add with wrong attribute', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .post('/content/block')
        .send({
          attribute: [
            {attribute: 'WRONG', string: 'VALUE'},
          ],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong lang', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      await request(app.getHttpServer())
        .post('/content/block')
        .send({
          attribute: [
            {attribute: 'NAME', string: 'VALUE', lang: 'WRONG'},
          ],
        })
        .expect(400);
    });

    test('Shouldn`t add without string', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .post('/content/block')
        .send({attribute: [{attribute: 'NAME'}]})
        .expect(400);
    });
  });

  describe('Content block addition with description', () => {
    test('Should add with description', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.DESCRIPTION}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/block')
        .send({
          attribute: [
            {attribute: 'NAME', description: 'TEXT'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toEqual([{attribute: 'NAME', description: 'TEXT'}]);
    });

    test('Should add with lang description', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.DESCRIPTION}).save();
      await Object.assign(new LangEntity(), {id: 'GR'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/block')
        .send({
          attribute: [
            {attribute: 'NAME', description: 'TEXT', lang: 'GR'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toEqual([{attribute: 'NAME', description: 'TEXT', lang: 'GR'}]);
    });

    test('Shouldn`t add with wrong attribute', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.DESCRIPTION}).save();

      await request(app.getHttpServer())
        .post('/content/block')
        .send({
          attribute: [
            {attribute: 'WRONG', description: 'TEXT'},
          ],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong lang', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.DESCRIPTION}).save();
      await Object.assign(new LangEntity(), {id: 'GR'}).save();

      await request(app.getHttpServer())
        .post('/content/block')
        .send({
          attribute: [
            {attribute: 'NAME', description: 'TEXT', lang: 'WRONG'},
          ],
        })
        .expect(400);
    });
  });

  describe('Content block addition with point', () => {
    test('Should add with point', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'London', directory}).save();
      await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/block')
        .send({
          attribute: [
            {attribute: 'CURRENT', point: 'London'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('CURRENT');
      expect(inst.body.attribute[0].point).toBe('London');
      expect(inst.body.attribute[0].directory).toBe('CITY');
    });

    test('Shouldn`t add with wrong point', async () => {
      await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();

      await request(app.getHttpServer())
        .post('/content/block')
        .send({
          attribute: [
            {attribute: 'CURRENT', point: 'WRONG'},
          ],
        })
        .expect(400);
    });

    test('Shouldn`t add with blank point', async () => {
      await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();

      await request(app.getHttpServer())
        .post('/content/block')
        .send({
          attribute: [
            {attribute: 'CURRENT'},
          ],
        })
        .expect(400);
    });
  });

  describe('Content block addition with flag', () => {
    test('Should add with flag', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/block')
        .send({
          id: 'BLOCK',
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });

    test('Shouldn`t add with duplicate flag', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .post('/content/block')
        .send({
          id: 'BLOCK',
          flag: ['ACTIVE', 'ACTIVE'],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong flag', async () => {
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.BLOCK}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .post('/content/block')
        .send({
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });
});