import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { ElementEntity } from '../../model/element/element.entity';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { BlockEntity } from '../../model/block/block.entity';
import * as request from 'supertest';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { AttributeEntity, AttributeType } from '../../../settings/model/attribute/attribute.entity';
import { Element4stringEntity } from '../../model/element/element4string.entity';
import { Element4descriptionEntity } from '../../model/element/element4description.entity';
import { Element4IntervalEntity } from '../../model/element/element4interval.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { Element4pointEntity } from '../../model/element/element4point.entity';
import { Element4elementEntity } from '../../model/element/element4element.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { Element2flagEntity } from '../../model/element/element2flag.entity';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { FileEntity } from '../../../storage/model/file/file.entity';
import { Element2imageEntity } from '../../model/element/element2image.entity';

describe('Element updating', () => {
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

  describe('Content element fields update', () => {
    test('Should update item', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement().withBlock(block);

      const item = await request(app.getHttpServer())
        .put(`/content/element/${parent.id}`)
        .send({id: 'UPDATED', block: 'BLOCK'})
        .expect(200);

      expect(item.body.id).toBe('UPDATED');
      expect(item.body.block).toBe('BLOCK');
    });

    test('Should change element id', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement().withBlock(block);

      await request(app.getHttpServer())
        .put(`/content/element/${parent.id}`)
        .send({id: 'SOME', block: 'BLOCK', permission: [{method: 'ALL'}]})
        .expect(200);

      const item = await request(app.getHttpServer())
        .get(`/content/element/SOME`)
        .expect(200);

      expect(item.body.id).toBe('SOME');
    });

    test('Should change element sort', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);

      await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({id: 'SOME', block: 'BLOCK', sort: 333, permission: [{method: 'ALL'}]})
        .expect(200);

      const item = await request(app.getHttpServer())
        .get(`/content/element/SOME`)
        .expect(200);

      expect(item.body.sort).toBe(333);
    });

    test('Should change element block', async () => {
      const block = await new BlockEntity('BLOCK_1').save();
      await new BlockEntity('BLOCK_2').save();
      const parent = await createElement().withBlock(block);

      const item = await request(app.getHttpServer())
        .put(`/content/element/${parent.id}`)
        .send({id: parent.id, block: 'BLOCK_2'})
        .expect(200);

      expect(item.body.block).toBe('BLOCK_2');
    });

    test('Should`t update without block', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);

      await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({id: 1})
        .expect(400);
    });

    test('Shouldn`t change with wrong id', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);

      await request(app.getHttpServer())
        .put(`/content/element/WRONG`)
        .send({id: 'WRONG'})
        .expect(404);
    });

    test('Shouldn`t update without id', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);

      await request(app.getHttpServer())
        .put('/content/element/ELEMENT')
        .send({block: 'BLOCK'})
        .expect(400);
    });
  });

  describe('Content element permission update', () => {
    test('Should add access', async () => {
      await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);

      const inst = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          permission: [{group: 'NEW', method: 'READ'}],
        })
        .expect(200);

      expect(inst.body.permission).toEqual([
        {group: 'NEW', method: 'READ'},
      ]);
    });

    test('Should add without group', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);

      const inst = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          permission: [{method: 'READ'}],
        })
        .expect(200);

      expect(inst.body.permission).toEqual([{method: 'READ'}]);
    });

    test('Shouldn`t add with wrong method', async () => {
      await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);

      await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          permission: [
            {group: 'NEW', method: 'WRONG'},
          ],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong group', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);

      await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          permission: [
            {group: 'WRONG', method: 'READ'},
          ],
        })
        .expect(400);
    });

    test('Should remove access', async () => {
      await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      await Object.assign(new Element2permissionEntity(), {parent, method: 'READ', group: 'NEW'}).save();

      const inst = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          permission: [
            {group: 'NEW', method: 'ALL'},
          ],
        })
        .expect(200);

      expect(inst.body.permission).toEqual([
        {group: 'NEW', method: 'ALL'},
      ]);
    });
  });

  describe('Content element string update', () => {
    test('Should add string', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{
            attribute: 'NAME',
            string: 'VALUE',
          }],
        })
        .expect(200);

      expect(item.body.attribute).toEqual([{attribute: 'NAME', string: 'VALUE'}]);
    });

    test('Shouldn`t add without string', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{
            attribute: 'NAME',
          }],
        })
        .expect(400);

      await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{
            attribute: 'NAME',
            string: null,
          }],
        })
        .expect(400);
    });

    test('Should remove strings', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE'}).save();
      await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE'}).save();
      await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [],
        })
        .expect(200);

      expect(item.body.attribute).toHaveLength(0);
    });

    test('Should change string', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE_1'}).save();
      await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE_2'}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{attribute: 'NAME', string: 'ANOTHER'}],
        })
        .expect(200);

      expect(item.body.attribute).toEqual([{attribute: 'NAME', string: 'ANOTHER'}]);
    });
  });

  describe('Content element description update', () => {
    test('Should add description', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.DESCRIPTION}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{
            attribute: 'NAME',
            description: 'TEXT',
          }],
        })
        .expect(200);

      expect(item.body.attribute).toEqual([{attribute: 'NAME', description: 'TEXT'}]);
    });

    test('Should remove description', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      const attribute = await Object.assign(
        new AttributeEntity(),
        {id: 'NAME', type: AttributeType.DESCRIPTION},
      ).save();
      await Object.assign(new Element4descriptionEntity(), {parent, attribute, description: 'VALUE'}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [],
        })
        .expect(200);

      expect(item.body.attribute).toHaveLength(0);
    });

    test('Should change description', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      const attribute = await Object.assign(
        new AttributeEntity(),
        {id: 'NAME', type: AttributeType.DESCRIPTION},
      ).save();
      await Object.assign(new Element4descriptionEntity(), {parent, attribute, description: 'VALUE_1'}).save();
      await Object.assign(new Element4descriptionEntity(), {parent, attribute, description: 'VALUE_2'}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', description: 'VALUE_3'},
            {attribute: 'NAME', description: 'VALUE_4'},
          ],
        })
        .expect(200);

      expect(item.body.attribute).toEqual([
        {attribute: 'NAME', description: 'VALUE_3'},
        {attribute: 'NAME', description: 'VALUE_4'},
      ]);
    });

    test('Shouldn`t update with wrong attribute', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.DESCRIPTION}).save();

      await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{
            attribute: 'WRONG',
            description: 'TEXT',
          }],
        })
        .expect(400);
    });
  });

  describe('Content element interval update', () => {
    test('Should add interval', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.INTERVAL}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{
            attribute: 'NAME',
            from: '2001-01-01T00:00:00.000Z',
          }],
        })
        .expect(200);

      expect(item.body.attribute).toEqual([{
        attribute: 'NAME', from: '2001-01-01T00:00:00.000Z', to: null,
      }]);
    });

    test('Should update interval', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.INTERVAL}).save();
      await Object.assign(new Element4IntervalEntity(), {
        attribute,
        parent,
        from: new Date('2001-01-01T00:00:00.000Z'),
      }).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{
            attribute: 'NAME',
            from: '2001-01-02T00:00:00.000Z',
          }],
        })
        .expect(200);

      expect(item.body.attribute).toEqual([{
        attribute: 'NAME', from: '2001-01-02T00:00:00.000Z', to: null,
      }]);
    });

    test('Should add with from and to', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.INTERVAL}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{
            attribute: 'NAME',
            from: '2001-01-01T00:00:00.000Z',
            to: '2002-01-01T00:00:00.000Z',
          }],
        })
        .expect(200);

      expect(item.body.attribute).toEqual([{
        attribute: 'NAME', from: '2001-01-01T00:00:00.000Z', to: '2002-01-01T00:00:00.000Z',
      }]);
    });

    test('Shouldn`t update without attribute', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.INTERVAL}).save();

      await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{
            from: '2001-01-01T00:00:00.000Z',
          }],
        })
        .expect(400);
    });

    test('Shouldn`t with wrong date format', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.INTERVAL}).save();

      await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{
            attribute: 'NAME',
            from: 'WRONG',
          }],
        })
        .expect(400);
    });
  });

  describe('Content element point update', () => {
    test('Should add point', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.POINT}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{attribute: 'NAME', point: 'LONDON'}],
        })
        .expect(200);

      expect(item.body.attribute).toEqual([{attribute: 'NAME', point: 'LONDON', directory: 'CITY'}]);
    });

    test('Should remove point', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.POINT}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      await Object.assign(new Element4pointEntity(), {point, parent, attribute}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [],
        })
        .expect(200);

      expect(item.body.attribute).toHaveLength(0);
    });

    test('Should change point', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME', type: AttributeType.POINT}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();
      await Object.assign(new Element4pointEntity(), {point, parent, attribute}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{attribute: 'NAME', point: 'PARIS'}],
        })
        .expect(200);

      expect(item.body.attribute).toHaveLength(1);
      expect(item.body.attribute[0].attribute).toBe('NAME');
      expect(item.body.attribute[0].point).toBe('PARIS');
      expect(item.body.attribute[0].directory).toBe('CITY');
    });
  });

  describe('Content element counter update', () => {
    test('Should add counter', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new AttributeEntity(), {id: 'REST', type: AttributeType.COUNTER}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{attribute: 'REST', counter: 'LONDON', count: 222}],
        })
        .expect(200);

      expect(item.body.attribute).toEqual([
        {attribute: 'REST', counter: 'LONDON', directory: 'CITY', count: 222},
      ]);
    });
  });

  describe('Content element element update', () => {
    test('Should add element', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new AttributeEntity(), {id: 'CHILD'}).save();
      await Object.assign(new ElementEntity(), {id: 'CHILD', block}).save();

      const res = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [{attribute: 'CHILD', element: 'CHILD'}],
        })
        .expect(200);

      expect(res.body.attribute).toHaveLength(1);
      expect(res.body.attribute[0].attribute).toBe('CHILD');
      expect(res.body.attribute[0].element).toBe('CHILD');
    });

    test('Should remove element', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CHILD'}).save();
      const element = await Object.assign(new ElementEntity(), {block}).save();
      await Object.assign(new Element4elementEntity(), {parent, attribute, element}).save();

      const res = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          attribute: [],
        })
        .expect(200);

      expect(res.body.attribute).toHaveLength(0);
    });
  });

  describe('Content element flag update', () => {
    test('Should add flag', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(item.body.flag).toEqual(['ACTIVE']);
    });

    test('Should update flag only', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const item = await request(app.getHttpServer())
        .patch(`/content/element/ELEMENT`)
        .send({flag: ['ACTIVE']})
        .expect(200);

      expect(item.body.id).toEqual('ELEMENT');
      expect(item.body.flag).toEqual(['ACTIVE']);
    });

    test('Should multiple update flag', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement().withBlock(block);
      await createElement().withBlock(block);
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const item = await request(app.getHttpServer())
        .patch(`/content/element/ELEMENT`)
        .send({flag: ['ACTIVE']})
        .expect(200);

      expect(item.body.id).toEqual('ELEMENT');
      expect(item.body.flag).toEqual(['ACTIVE']);
    });

    test('Shouldn`t add duplicate flag', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          flag: ['ACTIVE', 'ACTIVE'],
        })
        .expect(400);
    });

    test('Should remove flag', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Element2flagEntity(), {parent, flag}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          flag: [],
        })
        .expect(200);

      expect(item.body.flag).toEqual([]);
    });

    test('Should change flag', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      const flag = await Object.assign(new FlagEntity(), {id: 'OLD'}).save();
      await Object.assign(new FlagEntity(), {id: 'UPDATED'}).save();
      await Object.assign(new Element2flagEntity(), {parent, flag}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          flag: ['UPDATED'],
        })
        .expect(200);

      expect(item.body.flag).toEqual(['UPDATED']);
    });
  });

  describe('Content element image update', () => {
    test('Should add image', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt.txt`,
        },
      ).save();
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          image: [1],
        })
        .expect(200);

      expect(item.body.image).toHaveLength(1);
      expect(item.body.image[0].image).toBe(1);
      expect(item.body.image[0].collection).toBe('DETAIL');
    });

    test('Should remove image', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      const image = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt.txt`,
        },
      ).save();
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      await Object.assign(new Element2imageEntity(), {parent, image}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          image: [],
        })
        .expect(200);

      expect(item.body.image).toHaveLength(0);
    });

    test('Should change image', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      const image = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt.txt`,
        },
      ).save();
      await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt1.txt`,
        },
      ).save();
      const block = await new BlockEntity('BLOCK').save();
      const parent = await createElement('ELEMENT').withBlock(block);
      await Object.assign(new Element2imageEntity(), {parent, image}).save();

      const item = await request(app.getHttpServer())
        .put(`/content/element/ELEMENT`)
        .send({
          id: 'ELEMENT',
          block: 'BLOCK',
          image: [2],
        })
        .expect(200);

      expect(item.body.image).toHaveLength(1);
      expect(item.body.image[0].image).toBe(2);
      expect(item.body.image[0].collection).toBe('DETAIL');
    });
  });
});