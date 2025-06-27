import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import * as request from 'supertest';
import { ElementEntity } from '../../model/element/element.entity';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { BlockEntity } from '../../model/block/block.entity';
import { AttributeEntity, AttributeType } from '../../../settings/model/attribute/attribute.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { FileEntity } from '../../../storage/model/file/file.entity';

describe('Element addition', () => {
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

  async function createElement1(block: number = 1): Promise<ElementEntity> {
    const parent = await Object.assign(new ElementEntity, {block}).save();
    await Object.assign(
      new Element2permissionEntity(),
      {parent, group: '1', method: PermissionMethod.ALL},
    ).save();

    return parent;
  }

  function createElement(id?: string): Promise<ElementEntity> & any {
    const item = new ElementEntity();
    item.id = id;

    let permission = null;

    const operations = {
      withBlock(block: BlockEntity) {
        item.block = block;
        return this;
      },
      withSort(sort: number) {
        item.sort = sort;
        return this;
      },
      withVersion(version: number) {
        item.version = version;
        return this;
      },
      withPermission(
        group: string | null,
        method: PermissionMethod | null = PermissionMethod.ALL,
      ) {
        if (!permission) permission = [];
        if (method) permission.push({group, method});
        return this;
      },
    };

    return Object.assign(Promise.resolve({
      then: resolve => resolve(item.save().then(async parent => {
        for (const perm of permission ?? [{group: null, method: PermissionMethod.ALL}]) {
          await Object.assign(
            new Element2permissionEntity(),
            {parent, group: perm.group, method: perm.method},
          ).save();
        }

        return parent;
      })),
    }), operations);
  }

  describe('Content element addition with fields', () => {
    test('Should add element', async () => {
      await new BlockEntity('BLOCK').save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          permission: [{method: 'ALL'}],
        })
        .expect(201);

      expect(inst.body.id).toHaveLength(36);
      expect(inst.body.block).toBe('BLOCK');
      expect(inst.body.created_at).toBeDefined();
      expect(inst.body.updated_at).toBeDefined();
      expect(inst.body.version).toBe(1);
      expect(inst.body.permission).toEqual([{method: 'ALL'}]);
    });

    test('Should add with sort', async () => {
      await new BlockEntity('BLOCK').save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          sort: 777,
        })
        .expect(201);

      expect(inst.body.sort).toBe(777);
    });

    test('Should add and get element', async () => {
      await new BlockEntity('BLOCK').save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          permission: [{method: 'ALL'}],
        })
        .expect(201);

      const inst = await request(app.getHttpServer())
        .get('/content/element/ELEMENT')
        .expect(200);

      expect(inst.body.id).toBe('ELEMENT');
      expect(inst.body.block).toBe('BLOCK');
    });

    test('Shouldn`t add without block', async () => {
      await Object.assign(new BlockEntity(), {}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({})
        .expect(400);
    });

    test('Shouldn`t add with wrong block', async () => {
      await new BlockEntity().save();
      await request(app.getHttpServer())
        .post('/content/element')
        .send({block: 'WRONG'})
        .expect(400);
    });
  });

  describe('Content element addition with permission', () => {
    test('Should add with permission', async () => {
      await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
      await new BlockEntity('BLOCK').save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          permission: [{group: 'NEW', method: 'READ'}],
        })
        .expect(201);

      expect(inst.body.permission).toEqual([{group: 'NEW', method: 'READ'}]);
    });

    test('Should add without group', async () => {
      await new BlockEntity('BLOCK').save();
      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          permission: [{method: 'READ'}],
        })
        .expect(201);

      expect(inst.body.permission).toEqual([{method: 'READ'}]);
    });

    test('Shouldn`t add with wrong group', async () => {
      await new BlockEntity('BLOCK').save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          permission: [{group: 777, method: 'READ'}],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong method', async () => {
      await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
      await new BlockEntity('BLOCK').save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 1,
          permission: [{group: 'NEW', method: 'WRONG'}],
        })
        .expect(400);
    });
  });

  describe('Content element addition with string', () => {
    test('Should add with strings', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Shouldn`t add with wrong attribute', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'WRONG', string: 'VALUE'},
          ],
        })
        .expect(400);
    });
  });

  describe('Content element addition with description', () => {
    test('Should add with description', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'TEXT'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'TEXT', description: 'VALUE'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toEqual([{attribute: 'TEXT', description: 'VALUE'}]);
    });

    test('Shouldn`t add with wrong description attribute', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'WRONG', description: 'VALUE'},
          ],
        })
        .expect(400);
    });
  });

  describe('Content element addition with interval', () => {
    test('Should add with interval', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'DATE', type: AttributeType.INTERVAL}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'DATE', from: '2001-01-01T00:00:00.000Z'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toEqual([{from: '2001-01-01T00:00:00.000Z', to: null, attribute: 'DATE'}]);
    });

    test('Should add with from and to', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'DATE', type: AttributeType.INTERVAL}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {
              attribute: 'DATE',
              from: '2001-01-01T00:00:00.000Z',
              to: '2001-01-02T00:00:00.000Z',
            },
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toEqual([{
        from: '2001-01-01T00:00:00.000Z', to: '2001-01-02T00:00:00.000Z', attribute: 'DATE',
      }]);
    });

    test('Shouldn`t add with wrong date', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'DATE', type: AttributeType.INTERVAL}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'DATE', from: 'WRONG'},
          ],
        })
        .expect(400);
    });

    test('Shouldn`t add without attribute', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'DATE', type: AttributeType.INTERVAL}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [{from: '2001-01-01T00:00:00.000Z'}],
        })
        .expect(400);
    });
  });

  describe('Content element addition with point', () => {
    test('Should add with point', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.POINT}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', point: 'LONDON'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].point).toBe('LONDON');
      expect(inst.body.attribute[0].directory).toBe('CITY');
    });

    test('Shouldn`t add with wrong point', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.POINT}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', point: 'WRONG'},
          ],
        })
        .expect(400);
    });

    test('Shouldn`t add with duplicate point', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.POINT}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', point: 'LONDON'},
            {attribute: 'NAME', point: 'LONDON'},
          ],
        })
        .expect(400);
    });
  });

  describe('Content element addition with counter', () => {
    test('Should add with counter', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'REST', type: AttributeType.COUNTER}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'REST', counter: 'LONDON', count: 333},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('REST');
      expect(inst.body.attribute[0].counter).toBe('LONDON');
      expect(inst.body.attribute[0].directory).toBe('CITY');
      expect(inst.body.attribute[0].count).toBe(333);
    });

    test('Shouldn`t add with wrong attribute', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'REST', type: AttributeType.COUNTER}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'WRONG', counter: 'LONDON', count: 333},
          ],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong counter', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'REST', type: AttributeType.COUNTER}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'REST', counter: 'WRONG', count: 333},
          ],
        })
        .expect(400);
    });
  });

  describe('Content element addition with element', () => {
    test('Should add with element', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new ElementEntity(), {id: 'CHILD', block}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', element: 'CHILD'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].element).toBe('CHILD');
    });

    test('Shouldn`t add with wrong element', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new ElementEntity(), {id: 'CHILD', block}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', element: 'WRONG'},
          ],
        })
        .expect(400);
    });

    test('Shouldn`t add with duplicate element', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new ElementEntity(), {id: 'CHILD', block}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', element: 'CHILD'},
            {attribute: 'NAME', element: 'CHILD'},
          ],
        })
        .expect(400);
    });
  });

  describe('Content element addition with flag', () => {
    test('Should add with flag', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });

    test('Should add with many flags', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new FlagEntity(), {id: 'FLAG_1'}).save();
      await Object.assign(new FlagEntity(), {id: 'FLAG_2'}).save();
      await Object.assign(new FlagEntity(), {id: 'FLAG_3'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          flag: ['FLAG_1', 'FLAG_2', 'FLAG_3'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['FLAG_1', 'FLAG_2', 'FLAG_3']);
    });

    test('Shouldn`t add with wrong flag', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          flag: ['WRONG'],
        })
        .expect(400);
    });

    test('Shouldn`t add with duplicate flag', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          flag: ['ACTIVE', 'ACTIVE'],
        })
        .expect(400);
    });
  });

  describe('Content element addition with image', () => {
    test('Should add with image', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt.txt`,
        },
      ).save();
      await new BlockEntity('BLOCK').save();

      const inst = await request(app.getHttpServer())
        .post('/content/element')
        .send({
          block: 'BLOCK',
          image: [1],
        })
        .expect(201);

      expect(inst.body.image).toHaveLength(1);
      expect(inst.body.image[0].image).toBe(1);
      expect(inst.body.image[0].collection).toBe('SHORT');
    });
  });
});