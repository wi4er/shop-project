import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { BlockEntity } from '../../model/block/block.entity';
import { ElementEntity } from '../../model/element/element.entity';
import { Element4stringEntity } from '../../model/element/element4string.entity';
import { Element2flagEntity } from '../../model/element/element2flag.entity';
import { DirectoryEntity } from '../../../registry/model/directory.entity';
import { PointEntity } from '../../../registry/model/point.entity';
import { Element4pointEntity } from '../../model/element/element4point.entity';
import { SectionEntity } from '../../model/section/section.entity';
import { Element2sectionEntity } from '../../model/element/element2section.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { UserEntity } from '../../../personal/model/user/user.entity';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { User2groupEntity } from '../../../personal/model/user/user2group.entity';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { Element4elementEntity } from '../../model/element/element4element.entity';
import { CollectionEntity } from '../../../storage/model/collection.entity';
import { Element2imageEntity } from '../../model/element/element2image.entity';
import { FileEntity } from '../../../storage/model/file.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('ElementController', () => {
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

  async function createSession(): Promise<string> {
    const group = await Object.assign(new GroupEntity(), {id: '1'}).save();
    const parent = await Object.assign(new UserEntity(), {
      id: '1',
      login: 'USER',
      hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
    }).save();
    await Object.assign(new User2groupEntity(), {id: '1', group, parent}).save();

    const res = await request(app.getHttpServer())
      .post('/personal/auth')
      .send({
        login: 'USER',
        password: 'qwerty',
      })
      .expect(201);

    return res.headers['set-cookie'];
  }

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
    item.block = null;

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

  describe('Content element list', () => {
    test('Should get empty element list', async () => {
      const list = await request(app.getHttpServer())
        .get('/content/element')
        .expect(200);

      expect(list.body).toEqual([]);
    });

    test('Should get element list', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await createElement().withBlock(block);
      }

      const list = await request(app.getHttpServer())
        .get('/content/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(10);
    });

    test('Should get element with group access', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await createElement()
          .withBlock(block)
          .withPermission('1', i % 2 ? PermissionMethod.READ : PermissionMethod.WRITE);
      }

      const list = await request(app.getHttpServer())
        .get('/content/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(5);
    });

    test('Should get element with public access', async () => {
      const block = await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await createElement()
          .withBlock(block)
          .withPermission(null, i % 2 ? PermissionMethod.READ : PermissionMethod.WRITE);
      }

      const list = await request(app.getHttpServer())
        .get('/content/element')
        .expect(200);

      expect(list.body).toHaveLength(5);
    });

    test('Should get list with block filter', async () => {
      const cookie = await createSession();
      const block1 = await new BlockEntity().save();
      const block2 = await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await createElement().withBlock(i % 2 === 1 ? block1 : block2);
      }

      const list = await request(app.getHttpServer())
        .get('/content/element?filter[block]=1')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(5);
    });

    test('Should get list with offset', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();

      for (let i = 0; i < 10; i++) await createElement(`ELEMENT_${i}`).withBlock(block);

      const list = await request(app.getHttpServer())
        .get('/content/element?offset=5')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(5);
      expect(list.body[0].id).toBe('ELEMENT_5');
      expect(list.body[4].id).toBe('ELEMENT_9');
    });

    test('Should get list with limit', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();

      for (let i = 0; i < 10; i++) await createElement(`ELEMENT_${i}`).withBlock(block);

      const list = await request(app.getHttpServer())
        .get('/content/element?limit=2')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(2);
      expect(list.body[0].id).toBe('ELEMENT_0');
      expect(list.body[1].id).toBe('ELEMENT_1');
    });
  });

  describe('Content element sorting', () => {
    test('Should get with sort order', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();

      for (let i = 1; i <= 10; i++) {
        await createElement()
          .withBlock(block)
          .withSort(1000 - i * 100)
          .withVersion(i % 2 ? 1 : 10);
      }

      const list = await request(app.getHttpServer())
        .get('/content/element?sort[version]=asc&sort[sort]=desc')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(10);
      expect(list.body[0].sort).toBe(900);
      expect(list.body[1].sort).toBe(700);
      expect(list.body[2].sort).toBe(500);
      expect(list.body[3].sort).toBe(300);
      expect(list.body[4].sort).toBe(100);
    });
  });

  describe('Content element item', () => {
    test('Should get element item', async () => {
      await createElement('ELEMENT').withBlock(await new BlockEntity().save());

      const item = await request(app.getHttpServer())
        .get(`/content/element/ELEMENT`)
        .expect(200);

      expect(item.body.id).toBe('ELEMENT');
      expect(item.body.created_at).toBeDefined();
      expect(item.body.updated_at).toBeDefined();
      expect(item.body.version).toBe(1);
      expect(item.body.sort).toBe(100);
      expect(item.body.block).toBe(1);
    });

    test('Shouldn`t get with wrong id', async () => {
      await createElement('ELEMENT').withBlock(await new BlockEntity().save());

      await request(app.getHttpServer())
        .get('/content/element/999')
        .expect(404);
    });

    test('Shouldn`t get element without item permission', async () => {
      await createElement('NAME')
        .withBlock(await new BlockEntity().save())
        .withPermission(null, null);

      await request(app.getHttpServer())
        .get('/content/element/NAME')
        .expect(403);
    });
  });

  describe('Content element count', () => {
    test('Should get empty element count', async () => {
      const list = await request(app.getHttpServer())
        .get('/content/element/count')
        .expect(200);

      expect(list.body).toEqual({count: 0});
    });

    test('Should get element count', async () => {
      const block = await new BlockEntity().save();

      for (let i = 0; i < 10; i++) await createElement().withBlock(block);

      const list = await request(app.getHttpServer())
        .get('/content/element/count')
        .expect(200);

      expect(list.body).toEqual({count: 10});
    });

    test('Should get element count with permission ', async () => {
      const block = await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await createElement(`ELEMENT_${i}`)
          .withBlock(block)
          .withPermission(null, i % 2 ? PermissionMethod.READ : null);
      }

      const list = await request(app.getHttpServer())
        .get('/content/element/count')
        .expect(200);

      expect(list.body).toEqual({count: 5});
    });

    test('Should get element count with group permission', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await createElement()
          .withBlock(block)
          .withPermission('1', i % 2 ? PermissionMethod.READ : null);
      }

      const list = await request(app.getHttpServer())
        .get('/content/element/count')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toEqual({count: 5});
    });
  });

  describe('Content element with images', () => {
    test('Should get element with images', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const image = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt.txt`,
        },
      ).save();
      const parent = await createElement().withBlock(block);
      await Object.assign(new Element2imageEntity(), {parent, image, collection}).save();

      const item = await request(app.getHttpServer())
        .get(`/content/element/${parent.id}`)
        .set('cookie', cookie)
        .expect(200);

      expect(item.body.image).toHaveLength(1);
      expect(item.body.image[0].image).toBe(1);
      expect(item.body.image[0].collection).toBe('SHORT');
      expect(item.body.image[0].path).toBe('txt/txt.txt');
    });
  });

  describe('Content element with strings', () => {
    test('Should get elements with strings', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await createElement().withBlock(block);
      await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const list = await request(app.getHttpServer())
        .get('/content/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].attribute).toHaveLength(1);
      expect(list.body[0].attribute[0].string).toBe('VALUE');
      expect(list.body[0].attribute[0].attribute).toBe('NAME');
    });

    test('Should get elements list with many properties', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      for (let i = 0; i < 10; i++) {
        const parent = await createElement();

        for (let j = 0; j < 10; j++) {
          await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE'}).save();
        }
      }

      const list = await request(app.getHttpServer())
        .get('/content/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(10);
      expect(list.body[0].attribute).toHaveLength(10);
      expect(list.body[0].attribute[0].string).toBe('VALUE');
      expect(list.body[0].attribute[0].attribute).toBe('NAME');
    });

    test('Should get elements list with properties and limit', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const attribute1 = await Object.assign(new AttributeEntity(), {id: 'NAME_1'}).save();
      const attribute2 = await Object.assign(new AttributeEntity(), {id: 'NAME_2'}).save();
      const attribute3 = await Object.assign(new AttributeEntity(), {id: 'NAME_3'}).save();

      for (let i = 1; i <= 10; i++) {
        const parent = await Object.assign(
          new ElementEntity,
          {id: `ELEMENT_${i.toString().padStart(2, '0')}`, block},
        ).save();
        await Object.assign(
          new Element2permissionEntity(),
          {parent, group: 1, method: PermissionMethod.ALL},
        ).save();

        await Object.assign(new Element4stringEntity(), {parent, attribute: attribute1, string: 'VALUE'}).save();
        await Object.assign(new Element4stringEntity(), {parent, attribute: attribute2, string: 'VALUE'}).save();
        await Object.assign(new Element4stringEntity(), {parent, attribute: attribute3, string: 'VALUE'}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/element?limit=3')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(3);
      expect(list.body[0].id).toBe('ELEMENT_01');
      expect(list.body[1].id).toBe('ELEMENT_02');
      expect(list.body[2].id).toBe('ELEMENT_03');
    });

    test('Should get elements with string filter', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await Object.assign(new ElementEntity, {block}).save();
      const parent = await createElement();
      await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const list = await request(app.getHttpServer())
        .get('/content/element?filter[string][eq]=VALUE')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].attribute).toHaveLength(1);
      expect(list.body[0].attribute[0].string).toBe('VALUE');
      expect(list.body[0].attribute[0].attribute).toBe('NAME');
    });

    test('Should get elements with string sort', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const name = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const gender = await Object.assign(new AttributeEntity(), {id: 'GENDER'}).save();

      for (let i = 0; i < 10; i++) {
        const parent = await createElement();
        await Object.assign(
          new Element4stringEntity(),
          {parent, attribute: name, string: `VALUE_${(Math.random() * 10 >> 0).toString().padStart(2, '0')}`},
        ).save();
        await Object.assign(
          new Element4stringEntity(),
          {parent, attribute: gender, string: `GENDER_${i.toString().padStart(2, '0')}`},
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/element?sort[string][NAME][eq]=asc')
        .set('cookie', cookie)
        .expect(200);

      // console.dir(list.body, { depth: 5 });
      // expect(list.body).toHaveLength(1);
      // expect(list.body[0].id).toBe(2);
      // expect(list.body[0].attribute).toHaveLength(1);
      // expect(list.body[0].attribute[0].string).toBe('VALUE');
      // expect(list.body[0].attribute[0].attribute).toBe('NAME');
    });
  });

  describe('Content element with section', () => {
    test('Should get elements with section', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const parent = await createElement();
      const section = await Object.assign(new SectionEntity(), {id: '1', block}).save();
      await Object.assign(new Element2sectionEntity(), {parent, section}).save();

      const list = await request(app.getHttpServer())
        .get('/content/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].section).toHaveLength(1);
      expect(list.body[0].section[0]).toBe('1');
    });

    test('Should get elements list with sections', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const parent1 = await createElement();
      const parent2 = await createElement();
      const section1 = await Object.assign(new SectionEntity(), {id: '1', block}).save();
      const section2 = await Object.assign(new SectionEntity(), {id: '2', block}).save();

      await Object.assign(new Element2sectionEntity(), {parent: parent1, section: section1}).save();
      await Object.assign(new Element2sectionEntity(), {parent: parent1, section: section2}).save();
      await Object.assign(new Element2sectionEntity(), {parent: parent2, section: section1}).save();
      await Object.assign(new Element2sectionEntity(), {parent: parent2, section: section2}).save();

      const list = await request(app.getHttpServer())
        .get('/content/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(2);
      expect(list.body[0].section).toHaveLength(2);
      expect(list.body[0].section[0]).toBe('1');
      expect(list.body[0].section[1]).toBe('2');
    });
  });

  describe('Content element with flags', () => {
    test('Should get element with flag', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const parent = await createElement().withBlock(block);
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Element2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/content/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });

    test('Should get element with flag filter', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const parent = await createElement().withBlock(block);
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Element2flagEntity(), {parent, flag, string: 'VALUE'}).save();

      const blank = await Object.assign(new ElementEntity, {block}).save();

      const list = await request(app.getHttpServer())
        .get('/content/element?filter[flag][eq]=ACTIVE')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0]['flag']).toEqual(['ACTIVE']);
    });
  });

  describe('Content element with point', () => {
    test('Should get element with point', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      const parent = await createElement();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = await Object.assign(new Element4pointEntity(), {parent, attribute, point}).save();

      const list = await request(app.getHttpServer())
        .get('/content/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].attribute).toHaveLength(1);
      expect(list.body[0].attribute[0].point).toBe('LONDON');
      expect(list.body[0].attribute[0].directory).toBe('CITY');
    });

    test('Should get element with point filter', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      for (let i = 0; i < 10; i++) {
        const parent = await createElement();

        if (i % 2) {
          await Object.assign(new Element4pointEntity(), {parent, attribute, point}).save();
        }
      }

      const list = await request(app.getHttpServer())
        .get('/content/element?filter[point][CITY][eq]=LONDON')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(5);
      expect(list.body[0].attribute).toHaveLength(1);
      expect(list.body[0].attribute[0].point).toBe('LONDON');
      expect(list.body[0].attribute[0].directory).toBe('CITY');
    });

    test('Should get element with point order', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      for (let i = 0; i < 10; i++) {
        const parent = await createElement();

        if (i % 2) {
          await Object.assign(new Element4pointEntity(), {parent, attribute, point}).save();
        }
      }

      const list = await request(app.getHttpServer())
        .get('/content/element?sort[point][CITY]=asc')
        .set('cookie', cookie)
        .expect(200);

      // expect(list.body).toHaveLength(5);
      // expect(list.body[0].attribute).toHaveLength(1);
      // expect(list.body[0].attribute[0].value).toBe('LONDON');
      // expect(list.body[0].attribute[0].registry).toBe('CITY');
    });
  });

  describe('Content element with element', () => {
    test('Should get element with element', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const parent = await createElement().withBlock(block);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const element = await Object.assign(
        new ElementEntity(),
        {id: 'ELEMENT', block},
      ).save();

      await Object.assign(
        new Element4elementEntity(),
        {parent, attribute, element},
      ).save();

      const list = await request(app.getHttpServer())
        .get('/content/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].attribute).toHaveLength(1);
      expect(list.body[0].attribute[0].attribute).toBe('CURRENT');
      expect(list.body[0].attribute[0].element).toBe('ELEMENT');
    });
  });

  describe('Content element addition', () => {
    describe('Element addition with fields', () => {
      test('Should add element', async () => {
        const cookie = await createSession();

        await new BlockEntity().save();
        const inst = await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            permission: [{group: 1, method: 'READ'}],
          })
          .set('cookie', cookie)
          .expect(201);

        expect(inst.body.block).toBe(1);
        expect(inst.body.id).toHaveLength(36);
        expect(inst.body.permission[0].method).toBe('READ');
        expect(inst.body.permission[0].group).toBe('1');
      });

      test('Should add with sort', async () => {
        const cookie = await createSession();

        await new BlockEntity().save();
        const inst = await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            sort: 777,
          })
          .set('cookie', cookie)
          .expect(201);

        expect(inst.body.sort).toBe(777);
      });

      test('Should add and get element', async () => {
        const cookie = await createSession();

        await new BlockEntity().save();
        await request(app.getHttpServer())
          .post('/content/element')
          .send({
            id: 'ELEMENT',
            block: 1,
            permission: [{group: 1, method: 'READ'}],
          })
          .set('cookie', cookie)
          .expect(201);

        const inst = await request(app.getHttpServer())
          .get('/content/element/ELEMENT')
          .set('cookie', cookie)
          .expect(200);

        expect(inst.body.id).toBe('ELEMENT');
        expect(inst.body.block).toBe(1);
      });

      test('Shouldn`t add without block', async () => {
        await request(app.getHttpServer())
          .post('/content/element')
          .send({})
          .expect(400);
      });

      test('Shouldn`t add with wrong block', async () => {
        await new BlockEntity().save();
        await request(app.getHttpServer())
          .post('/content/element')
          .send({block: 2})
          .expect(400);
      });
    });

    describe('Element addition with access', () => {
      test('Should add with access', async () => {
        await Object.assign(new GroupEntity(), {id: 'NEW'}).save();

        await new BlockEntity().save();
        const inst = await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            permission: [{group: 'NEW', method: 'READ'}],
          })
          .expect(201);

        expect(inst.body.permission).toEqual([{group: 'NEW', method: 'READ'}]);
      });

      test('Should add without group', async () => {
        await new BlockEntity().save();
        const inst = await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            permission: [{method: 'READ'}],
          })
          .expect(201);

        expect(inst.body.permission).toEqual([{method: 'READ'}]);
      });

      test('Shouldn`t add with wrong group', async () => {
        await new BlockEntity().save();

        await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            permission: [{group: 777, method: 'READ'}],
          })
          .expect(400);
      });

      test('Shouldn`t add with wrong method', async () => {
        await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
        await new BlockEntity().save();

        await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            permission: [{group: 'NEW', method: 'WRONG'}],
          })
          .expect(400);
      });
    });

    describe('Element addition with string', () => {
      test('Should add with strings', async () => {
        await new BlockEntity().save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        const inst = await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
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
        await new BlockEntity().save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            attribute: [
              {attribute: 'WRONG', string: 'VALUE'},
            ],
          })
          .expect(400);
      });
    });

    describe('Element addition with point', () => {
      test('Should add with point', async () => {
        await new BlockEntity().save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        const inst = await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
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
        await new BlockEntity().save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            attribute: [
              {attribute: 'NAME', point: 'WRONG'},
            ],
          })
          .expect(400);
      });

      test('Shouldn`t add with duplicate point', async () => {
        await new BlockEntity().save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            attribute: [
              {attribute: 'NAME', point: 'LONDON'},
              {attribute: 'NAME', point: 'LONDON'},
            ],
          })
          .expect(400);
      });
    });

    describe('Element addition with element', () => {
      test('Should add with element', async () => {
        const block = await new BlockEntity().save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new ElementEntity(), {id: 'CHILD', block}).save();

        const inst = await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            attribute: [
              {attribute: 'NAME', element: 'CHILD'},
            ],
          })
          .expect(201);

        expect(inst.body.attribute).toHaveLength(1);
        expect(inst.body.attribute[0].attribute).toBe('NAME');
        expect(inst.body.attribute[0].element).toBe('CHILD');
      });
    });

    describe('Element addition with flag', () => {
      test('Should add with flag', async () => {
        await new BlockEntity().save();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        const inst = await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            flag: ['ACTIVE'],
          })
          .expect(201);

        expect(inst.body.flag).toEqual(['ACTIVE']);
      });

      test('Shouldn`t add with wrong flag', async () => {
        await new BlockEntity().save();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            flag: ['WRONG'],
          })
          .expect(400);
      });

      test('Shouldn`t add with duplicate flag', async () => {
        await new BlockEntity().save();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            flag: ['ACTIVE', 'ACTIVE'],
          })
          .expect(400);
      });
    });

    describe('Element addition with image', () => {
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
        await new BlockEntity().save();

        const inst = await request(app.getHttpServer())
          .post('/content/element')
          .send({
            block: 1,
            image: [1],
          })
          .expect(201);

        expect(inst.body.image).toHaveLength(1);
        expect(inst.body.image[0].image).toBe(1);
        expect(inst.body.image[0].collection).toBe('SHORT');
      });
    });
  });

  describe('Content element update', () => {
    describe('Content element fields update', () => {
      test('Should update item', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({id: 'UPDATED', block: 1})
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.id).toBe('UPDATED');
        expect(item.body.block).toBe(1);
      });

      test('Should change element id', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();

        await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({id: 'SOME', block: 1, permission: [{method: 'ALL', group: '1'}]})
          .set('cookie', cookie)
          .expect(200);

        const item = await request(app.getHttpServer())
          .get(`/content/element/SOME`)
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.id).toBe('SOME');
      });

      test('Should change element sort', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();

        await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({id: 'SOME', block: 1, sort: 333, permission: [{method: 'ALL', group: '1'}]})
          .set('cookie', cookie)
          .expect(200);

        const item = await request(app.getHttpServer())
          .get(`/content/element/SOME`)
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.sort).toBe(333);
      });

      test('Should change element block', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        await new BlockEntity().save();
        const parent = await createElement();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({id: parent.id, block: 2})
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.block).toBe(2);
      });

      test('Should`t update without block', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();

        await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({id: 1})
          .set('cookie', cookie)
          .expect(400);
      });

      test('Shouldn`t change with wrong id', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        await createElement();

        await request(app.getHttpServer())
          .put(`/content/element/WRONG`)
          .send({id: 'WRONG'})
          .set('cookie', cookie)
          .expect(403);
      });

      test('Shouldn`t update without id', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        await createElement();

        await request(app.getHttpServer())
          .put('/content/element')
          .send({id: 1})
          .set('cookie', cookie)
          .expect(404);
      });
    });

    describe('Content element access update', () => {
      test('Should add access', async () => {
        const cookie = await createSession();
        await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
        await new BlockEntity().save();
        const parent = await createElement();

        const inst = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            permission: [
              {group: 'NEW', method: 'READ'},
            ],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(inst.body.permission).toEqual([
          {group: 'NEW', method: 'READ'},
        ]);
      });

      test('Should add without group', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();

        const inst = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            permission: [{method: 'READ'}],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(inst.body.permission).toEqual([{method: 'READ'}]);
      });

      test('Shouldn`t add with wrong method', async () => {
        const cookie = await createSession();
        await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
        await new BlockEntity().save();
        const parent = await createElement();

        await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            permission: [
              {group: 'NEW', method: 'WRONG'},
            ],
          })
          .set('cookie', cookie)
          .expect(400);
      });

      test('Shouldn`t add with wrong group', async () => {
        const cookie = await createSession();
        await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
        await new BlockEntity().save();
        const parent = await createElement();

        await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            permission: [
              {group: 'WRONG', method: 'READ'},
            ],
          })
          .set('cookie', cookie)
          .expect(400);
      });

      test('Should remove access', async () => {
        const cookie = await createSession();
        await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new Element2permissionEntity(), {parent, method: 'READ', group: 'NEW'}).save();

        const inst = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            permission: [
              {group: '1', method: 'ALL'},
            ],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(inst.body.permission).toEqual([
          {group: '1', method: 'ALL'},
        ]);
      });
    });

    describe('Content element string update', () => {
      test('Should add string', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            attribute: [{
              attribute: 'NAME',
              string: 'VALUE',
            }],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.attribute).toHaveLength(1);
        expect(item.body.attribute[0]['string']).toBe('VALUE');
        expect(item.body.attribute[0]['attribute']).toBe('NAME');
      });

      test('Shouldn`t add without string', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            attribute: [{
              attribute: 'NAME',
              string: null,
            }],
          })
          .set('cookie', cookie)
          .expect(400);
      });

      test('Should remove string', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            attribute: [],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.attribute).toHaveLength(0);
      });

      test('Should change string', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE_1'}).save();
        await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE_2'}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            attribute: [{attribute: 'NAME', string: 'ANOTHER'}],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.attribute).toHaveLength(1);
        expect(item.body.attribute[0].attribute).toBe('NAME');
        expect(item.body.attribute[0].string).toBe('ANOTHER');
      });
    });

    describe('Content element point update', () => {
      test('Should add point', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            attribute: [{attribute: 'NAME', point: 'LONDON'}],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.attribute).toHaveLength(1);
        expect(item.body.attribute[0].attribute).toBe('NAME');
        expect(item.body.attribute[0].point).toBe('LONDON');
        expect(item.body.attribute[0].directory).toBe('CITY');
      });

      test('Should remove point', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
        await Object.assign(new Element4pointEntity(), {point, parent, attribute}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            attribute: [],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.attribute).toHaveLength(0);
      });

      test('Should change point', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
        await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();
        await Object.assign(new Element4pointEntity(), {point, parent, attribute}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            attribute: [{attribute: 'NAME', point: 'PARIS'}],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.attribute).toHaveLength(1);
        expect(item.body.attribute[0].attribute).toBe('NAME');
        expect(item.body.attribute[0].point).toBe('PARIS');
        expect(item.body.attribute[0].directory).toBe('CITY');
      });
    });

    describe('Content element element update', () => {
      test('Should add element', async () => {
        const cookie = await createSession();
        const block = await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new AttributeEntity(), {id: 'CHILD'}).save();
        await Object.assign(new ElementEntity(), {id: 'CHILD', block}).save();

        const res = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            attribute: [
              {attribute: 'CHILD', element: 'CHILD'},
            ],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(res.body.attribute).toHaveLength(1);
        expect(res.body.attribute[0].attribute).toBe('CHILD');
        expect(res.body.attribute[0].element).toBe('CHILD');
      });

      test('Should remove element', async () => {
        const cookie = await createSession();
        const block = await new BlockEntity().save();
        const parent = await createElement();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'CHILD'}).save();
        const element = await Object.assign(new ElementEntity(), {block}).save();
        await Object.assign(new Element4elementEntity(), {parent, attribute, element}).save();

        const res = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            attribute: [],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(res.body.attribute).toHaveLength(0);
      });
    });

    describe('Content element flag update', () => {
      test('Should add flag', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            flag: ['ACTIVE'],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.flag).toEqual(['ACTIVE']);
      });

      test('Should update flag only', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        const item = await request(app.getHttpServer())
          .patch(`/content/element/${parent.id}`)
          .send({
            flag: ['ACTIVE'],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.flag).toEqual(['ACTIVE']);
      });

      test('Should multiple update flag', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        await createElement();
        await createElement();
        const parent = await createElement();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        const item = await request(app.getHttpServer())
          .patch(`/content/element/${parent.id}`)
          .send({flag: ['ACTIVE']})
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.id).toEqual(parent.id);
        expect(item.body.flag).toEqual(['ACTIVE']);
      });

      test('Shouldn`t add duplicate flag', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        const inst = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            flag: ['ACTIVE', 'ACTIVE'],
          })
          .set('cookie', cookie)
          .expect(400);
      });

      test('Should remove flag', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
        await Object.assign(new Element2flagEntity(), {parent, flag}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            flag: [],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.flag).toEqual([]);
      });

      test('Should change flag', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        const flag = await Object.assign(new FlagEntity(), {id: 'OLD'}).save();
        await Object.assign(new FlagEntity(), {id: 'UPDATED'}).save();
        await Object.assign(new Element2flagEntity(), {parent, flag}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            flag: ['UPDATED'],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.flag).toEqual(['UPDATED']);
      });
    });

    describe('Content element image update', () => {
      test('Should add image', async () => {
        const cookie = await createSession();
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
        await new BlockEntity().save();
        const parent = await createElement();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            image: [1],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.image).toHaveLength(1);
        expect(item.body.image[0].image).toBe(1);
        expect(item.body.image[0].collection).toBe('DETAIL');
      });

      test('Should remove image', async () => {
        const cookie = await createSession();
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
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new Element2imageEntity(), {parent, image}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            image: [],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.image).toHaveLength(0);
      });

      test('Should change image', async () => {
        const cookie = await createSession();
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
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new Element2imageEntity(), {parent, image}).save();

        const item = await request(app.getHttpServer())
          .put(`/content/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            image: [2],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.image).toHaveLength(1);
        expect(item.body.image[0].image).toBe(2);
        expect(item.body.image[0].collection).toBe('DETAIL');
      });
    });
  });

  describe('Content element deletion', () => {
    test('Should delete block', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      const parent = await createElement();

      const list = await request(app.getHttpServer())
        .delete(`/content/element/${parent.id}`)
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toEqual([parent.id]);
    });

    test('Shouldn`t delete with wrong id', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await createElement();

      await request(app.getHttpServer())
        .delete('/content/element/WRONG')
        .set('cookie', cookie)
        .expect(404);
    });

    test('Shouldn`t delete without permission', async () => {
      const block = await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {id: 'ELEMENT', block}).save();

      await request(app.getHttpServer())
        .delete('/content/element/ELEMENT')
        .expect(403);
    });
  });
});
