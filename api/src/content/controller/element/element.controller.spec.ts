import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { BlockEntity } from '../../model/block.entity';
import { ElementEntity } from '../../model/element.entity';
import { Element4stringEntity } from '../../model/element4string.entity';
import { Element2flagEntity } from '../../model/element2flag.entity';
import { DirectoryEntity } from '../../../directory/model/directory.entity';
import { PointEntity } from '../../../directory/model/point.entity';
import { Element4pointEntity } from '../../model/element4point.entity';
import { SectionEntity } from '../../model/section.entity';
import { Element2sectionEntity } from '../../model/element2section.entity';
import { PropertyEntity } from '../../../settings/model/property.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { UserEntity } from '../../../personal/model/user.entity';
import { GroupEntity } from '../../../personal/model/group.entity';
import { User2groupEntity } from '../../../personal/model/user2group.entity';
import { Element2permissionEntity } from '../../model/element2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { Element4elementEntity } from '../../model/element4element.entity';
import { CollectionEntity } from '../../../storage/model/collection.entity';
import { Element2imageEntity } from '../../model/element2image.entity';
import { FileEntity } from '../../../storage/model/file.entity';

describe('ElementController', () => {
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

  async function createSession(): Promise<string> {
    const group = await Object.assign(new GroupEntity(), {id: '1'}).save();
    const parent = await Object.assign(new UserEntity(), {
      id: '1',
      login: 'USER',
      hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
    }).save();
    await Object.assign(new User2groupEntity(), {id: '1', group, parent}).save();

    const res = await request(app.getHttpServer())
      .post('/auth')
      .send({
        login: 'USER',
        password: 'qwerty',
      })
      .expect(201);

    return res.headers['set-cookie'];
  }

  async function createElement(block: number = 1): Promise<ElementEntity> {
    const parent = await Object.assign(new ElementEntity, {block}).save();
    await Object.assign(
      new Element2permissionEntity(),
      {parent, group: '1', method: PermissionMethod.ALL},
    ).save();

    return parent;
  }

  describe('Content element list', () => {
    test('Should get empty element list', async () => {
      const list = await request(app.getHttpServer())
        .get('/element')
        .expect(200);

      expect(list.body).toEqual([]);
    });

    test('Should get element list', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await createElement();
      }

      const list = await request(app.getHttpServer())
        .get('/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(10);
    });

    test('Should get element with group permission', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        const parent = await Object.assign(new ElementEntity, {block: 1}).save();
        if (i % 2) await Object.assign(
          new Element2permissionEntity(),
          {parent, group: 1, method: PermissionMethod.READ},
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(5);
    });

    test('Should get element with public permission', async () => {
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        const parent = await Object.assign(new ElementEntity, {block: 1}).save();
        if (i % 2) await Object.assign(
          new Element2permissionEntity(),
          {parent, group: null, method: PermissionMethod.READ},
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/element')
        .expect(200);

      expect(list.body).toHaveLength(5);
    });

    test('Should get list with block filter', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await createElement(i % 2 + 1);
      }

      const list = await request(app.getHttpServer())
        .get('/element?filter[block]=1')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(5);
    });

    test('Should get list with offset', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) await createElement();

      const list = await request(app.getHttpServer())
        .get('/element?offset=5')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(5);
      // expect(list.body[0].id).toBe(6);
      // expect(list.body[4].id).toBe(10);
    });

    test('Should get list with limit', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) await createElement();

      const list = await request(app.getHttpServer())
        .get('/element?limit=2')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(2);
      // expect(list.body[0].id).toBe(1);
      // expect(list.body[4].id).toBe(5);
    });
  });

  describe('Content element sorting', () => {
    test('Should get with sort order', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();

      for (let i = 1; i <= 10; i++) {
        const parent = await Object.assign(
          new ElementEntity,
          {block, sort: 1000 - i * 100, version: i % 2 ? 1 : 10},
        ).save();
        await Object.assign(
          new Element2permissionEntity(),
          {parent, method: PermissionMethod.ALL},
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/element?sort[version]=asc&sort[sort]=desc')
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
      const cookie = await createSession();
      await new BlockEntity().save();
      const parent = await createElement();

      const item = await request(app.getHttpServer())
        .get(`/element/${parent.id}`)
        .set('cookie', cookie)
        .expect(200);

      expect(item.body.id).toBe(parent.id);
      expect(item.body.created_at).toBeDefined();
      expect(item.body.updated_at).toBeDefined();
      expect(item.body.version).toBe(1);
      expect(item.body.sort).toBe(100);
      expect(item.body.block).toBe(1);
    });

    test('Shouldn`t get with wrong id', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await createElement();

      await request(app.getHttpServer())
        .get('/element/999')
        .set('cookie', cookie)
        .expect(403);
    });

    test('Shouldn`t get element without permission', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await Object.assign(new ElementEntity, {id: 'NAME', block: 1}).save();

      await request(app.getHttpServer())
        .get('/element/NAME')
        .set('cookie', cookie)
        .expect(403);
    });
  });

  describe('Content element count', () => {
    test('Should get empty element count', async () => {
      const list = await request(app.getHttpServer())
        .get('/element/count')
        .expect(200);

      expect(list.body).toEqual({count: 0});
    });

    test('Should get element count', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) await createElement();

      const list = await request(app.getHttpServer())
        .get('/element/count')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toEqual({count: 10});
    });

    test('Should get element count with group permission ', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        const parent = await Object.assign(new ElementEntity, {block: 1}).save();
        if (i % 2) await Object.assign(
          new Element2permissionEntity(),
          {parent, group: 1, method: PermissionMethod.READ},
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/element/count')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toEqual({count: 5});
    });

    test('Should get element with permission count', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        const parent = await Object.assign(new ElementEntity, {block: 1}).save();
        if (i % 2) await Object.assign(
          new Element2permissionEntity(),
          {parent, method: PermissionMethod.READ},
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/element/count')
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
      const parent = await createElement(block.id);
      await Object.assign(new Element2imageEntity(), {parent, image, collection}).save();

      const item = await request(app.getHttpServer())
        .get(`/element/${parent.id}`)
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
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await createElement(block.id);
      await Object.assign(new Element4stringEntity(), {parent, property, string: 'VALUE'}).save();

      const list = await request(app.getHttpServer())
        .get('/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].string).toBe('VALUE');
      expect(list.body[0].property[0].property).toBe('NAME');
    });

    test('Should get elements list with many properties', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      for (let i = 0; i < 10; i++) {
        const parent = await createElement();

        for (let j = 0; j < 10; j++) {
          await Object.assign(new Element4stringEntity(), {parent, property, string: 'VALUE'}).save();
        }
      }

      const list = await request(app.getHttpServer())
        .get('/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(10);
      expect(list.body[0].property).toHaveLength(10);
      expect(list.body[0].property[0].string).toBe('VALUE');
      expect(list.body[0].property[0].property).toBe('NAME');
    });

    test('Should get elements list with properties and limit', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const property1 = await Object.assign(new PropertyEntity(), {id: 'NAME_1'}).save();
      const property2 = await Object.assign(new PropertyEntity(), {id: 'NAME_2'}).save();
      const property3 = await Object.assign(new PropertyEntity(), {id: 'NAME_3'}).save();

      for (let i = 1; i <= 10; i++) {
        const parent = await Object.assign(
          new ElementEntity,
          {id: `ELEMENT_${i.toString().padStart(2, '0')}`, block},
        ).save();
        await Object.assign(
          new Element2permissionEntity(),
          {parent, group: 1, method: PermissionMethod.ALL},
        ).save();

        await Object.assign(new Element4stringEntity(), {parent, property: property1, string: 'VALUE'}).save();
        await Object.assign(new Element4stringEntity(), {parent, property: property2, string: 'VALUE'}).save();
        await Object.assign(new Element4stringEntity(), {parent, property: property3, string: 'VALUE'}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/element?limit=3')
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
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const blank = await Object.assign(new ElementEntity, {block}).save();
      const parent = await createElement();
      await Object.assign(new Element4stringEntity(), {parent, property, string: 'VALUE'}).save();

      const list = await request(app.getHttpServer())
        .get('/element?filter[string][eq]=VALUE')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].string).toBe('VALUE');
      expect(list.body[0].property[0].property).toBe('NAME');
    });

    test('Should get elements with string sort', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const name = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const gender = await Object.assign(new PropertyEntity(), {id: 'GENDER'}).save();

      for (let i = 0; i < 10; i++) {
        const parent = await createElement();
        await Object.assign(
          new Element4stringEntity(),
          {parent, property: name, string: `VALUE_${(Math.random() * 10 >> 0).toString().padStart(2, '0')}`},
        ).save();
        await Object.assign(
          new Element4stringEntity(),
          {parent, property: gender, string: `GENDER_${i.toString().padStart(2, '0')}`},
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/element?sort[string][NAME][eq]=asc')
        .set('cookie', cookie)
        .expect(200);

      // console.dir(list.body, { depth: 5 });
      // expect(list.body).toHaveLength(1);
      // expect(list.body[0].id).toBe(2);
      // expect(list.body[0].property).toHaveLength(1);
      // expect(list.body[0].property[0].string).toBe('VALUE');
      // expect(list.body[0].property[0].property).toBe('NAME');
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
        .get('/element')
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
        .get('/element')
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
      const parent = await createElement(block.id);
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Element2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });

    test('Should get element with flag filter', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const parent = await createElement(block.id);
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Element2flagEntity(), {parent, flag, string: 'VALUE'}).save();

      const blank = await Object.assign(new ElementEntity, {block}).save();

      const list = await request(app.getHttpServer())
        .get('/element?filter[flag][eq]=ACTIVE')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0]['flag']).toEqual(['ACTIVE']);
    });
  });

  describe('Content element with point', () => {
    test('Should get element with point', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const parent = await createElement();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = await Object.assign(new Element4pointEntity(), {parent, property, point}).save();

      const list = await request(app.getHttpServer())
        .get('/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].point).toBe('LONDON');
      expect(list.body[0].property[0].directory).toBe('CITY');
    });

    test('Should get element with point filter', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      for (let i = 0; i < 10; i++) {
        const parent = await createElement();

        if (i % 2) {
          await Object.assign(new Element4pointEntity(), {parent, property, point}).save();
        }
      }

      const list = await request(app.getHttpServer())
        .get('/element?filter[point][CITY][eq]=LONDON')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(5);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].point).toBe('LONDON');
      expect(list.body[0].property[0].directory).toBe('CITY');
    });

    test('Should get element with point order', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      for (let i = 0; i < 10; i++) {
        const parent = await createElement();

        if (i % 2) {
          await Object.assign(new Element4pointEntity(), {parent, property, point}).save();
        }
      }

      const list = await request(app.getHttpServer())
        .get('/element?sort[point][CITY]=asc')
        .set('cookie', cookie)
        .expect(200);

      // expect(list.body).toHaveLength(5);
      // expect(list.body[0].property).toHaveLength(1);
      // expect(list.body[0].property[0].value).toBe('LONDON');
      // expect(list.body[0].property[0].directory).toBe('CITY');
    });
  });

  describe('Content element with element', () => {
    test('Should get element with element', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const parent = await createElement(block.id);
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const element = await Object.assign(
        new ElementEntity(),
        {id: 'ELEMENT', block},
      ).save();

      const inst = await Object.assign(
        new Element4elementEntity(),
        {parent, property, element},
      ).save();

      const list = await request(app.getHttpServer())
        .get('/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].property).toBe('CURRENT');
      expect(list.body[0].property[0].element).toBe('ELEMENT');
    });
  });

  describe('Content element addition', () => {
    describe('Element addition with fields', () => {
      test('Should add element', async () => {
        const cookie = await createSession();

        await new BlockEntity().save();
        const inst = await request(app.getHttpServer())
          .post('/element')
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
          .post('/element')
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
          .post('/element')
          .send({
            id: 'ELEMENT',
            block: 1,
            permission: [{group: 1, method: 'READ'}],
          })
          .set('cookie', cookie)
          .expect(201);

        const inst = await request(app.getHttpServer())
          .get('/element/ELEMENT')
          .set('cookie', cookie)
          .expect(200);

        expect(inst.body.id).toBe('ELEMENT');
        expect(inst.body.block).toBe(1);
      });

      test('Shouldn`t add without block', async () => {
        await request(app.getHttpServer())
          .post('/element')
          .send({})
          .expect(400);
      });

      test('Shouldn`t add with wrong block', async () => {
        await new BlockEntity().save();
        await request(app.getHttpServer())
          .post('/element')
          .send({block: 2})
          .expect(400)
          .expect({message: 'Block with id 2 not found!'});
      });
    });

    describe('Element addition with permission', () => {
      test('Should add with permission', async () => {
        await Object.assign(new GroupEntity(), {id: 'NEW'}).save();

        await new BlockEntity().save();
        const inst = await request(app.getHttpServer())
          .post('/element')
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
          .post('/element')
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
          .post('/element')
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
          .post('/element')
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
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

        const inst = await request(app.getHttpServer())
          .post('/element')
          .send({
            block: 1,
            property: [
              {property: 'NAME', string: 'VALUE'},
            ],
          })
          .expect(201);

        expect(inst.body.property).toHaveLength(1);
        expect(inst.body.property[0].property).toBe('NAME');
        expect(inst.body.property[0].string).toBe('VALUE');
      });

      test('Shouldn`t add with wrong property', async () => {
        await new BlockEntity().save();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

        await request(app.getHttpServer())
          .post('/element')
          .send({
            block: 1,
            property: [
              {property: 'WRONG', string: 'VALUE'},
            ],
          })
          .expect(400);
      });
    });

    describe('Element addition with point', () => {
      test('Should add with point', async () => {
        await new BlockEntity().save();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        const inst = await request(app.getHttpServer())
          .post('/element')
          .send({
            block: 1,
            property: [
              {property: 'NAME', point: 'LONDON'},
            ],
          })
          .expect(201);

        expect(inst.body.property).toHaveLength(1);
        expect(inst.body.property[0].property).toBe('NAME');
        expect(inst.body.property[0].point).toBe('LONDON');
        expect(inst.body.property[0].directory).toBe('CITY');
      });

      test('Shouldn`t add with wrong point', async () => {
        await new BlockEntity().save();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

        await request(app.getHttpServer())
          .post('/element')
          .send({
            block: 1,
            property: [
              {property: 'NAME', point: 'WRONG'},
            ],
          })
          .expect(400);
      });

      test('Shouldn`t add with duplicate point', async () => {
        await new BlockEntity().save();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        await request(app.getHttpServer())
          .post('/element')
          .send({
            block: 1,
            property: [
              {property: 'NAME', point: 'LONDON'},
              {property: 'NAME', point: 'LONDON'},
            ],
          })
          .expect(400);
      });
    });

    describe('Element addition with element', () => {
      test('Should add with element', async () => {
        const block = await new BlockEntity().save();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        await Object.assign(new ElementEntity(), {id: 'CHILD', block}).save();

        const inst = await request(app.getHttpServer())
          .post('/element')
          .send({
            block: 1,
            property: [
              {property: 'NAME', element: 'CHILD'},
            ],
          })
          .expect(201);

        expect(inst.body.property).toHaveLength(1);
        expect(inst.body.property[0].property).toBe('NAME');
        expect(inst.body.property[0].element).toBe('CHILD');
      });
    });

    describe('Element addition with flag', () => {
      test('Should add with flag', async () => {
        await new BlockEntity().save();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        const inst = await request(app.getHttpServer())
          .post('/element')
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
          .post('/element')
          .send({
            block: 1,
            flag: ['WRONG'],
          })
          .expect(400);
      });

      test('Shouldn`t add with duplicate flag', async () => {
        await new BlockEntity().save();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        const inst = await request(app.getHttpServer())
          .post('/element')
          .send({
            block: 1,
            flag: ['ACTIVE', 'ACTIVE'],
          })
          .expect(400);

        console.log(inst.body);
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
          .post('/element')
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
          .put(`/element/${parent.id}`)
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
          .put(`/element/${parent.id}`)
          .send({id: 'SOME', block: 1, permission: [{method: 'ALL', group: '1'}]})
          .set('cookie', cookie)
          .expect(200);

        const item = await request(app.getHttpServer())
          .get(`/element/SOME`)
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.id).toBe('SOME');
      });

      test('Should change element sort', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();

        await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
          .send({id: 'SOME', block: 1, sort: 333, permission: [{method: 'ALL', group: '1'}]})
          .set('cookie', cookie)
          .expect(200);

        const item = await request(app.getHttpServer())
          .get(`/element/SOME`)
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
          .put(`/element/${parent.id}`)
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
          .put(`/element/${parent.id}`)
          .send({id: 1})
          .set('cookie', cookie)
          .expect(400);
      });

      test('Shouldn`t change with wrong id', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        await createElement();

        await request(app.getHttpServer())
          .put(`/element/WRONG`)
          .send({id: 'WRONG'})
          .set('cookie', cookie)
          .expect(403);
      });

      test('Shouldn`t update without id', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        await createElement();

        await request(app.getHttpServer())
          .put('/element')
          .send({id: 1})
          .set('cookie', cookie)
          .expect(404);
      });
    });

    describe('Content element permission update', () => {
      test('Should add permission', async () => {
        const cookie = await createSession();
        await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
        await new BlockEntity().save();
        const parent = await createElement();

        const inst = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
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
          .put(`/element/${parent.id}`)
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
          .put(`/element/${parent.id}`)
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
          .put(`/element/${parent.id}`)
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

      test('Should remove permission', async () => {
        const cookie = await createSession();
        await Object.assign(new GroupEntity(), {id: 'NEW'}).save();
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new Element2permissionEntity(), {parent, method: 'READ', group: 'NEW'}).save();

        const inst = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
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
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

        const item = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            property: [{
              property: 'NAME',
              string: 'VALUE',
            }],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.property).toHaveLength(1);
        expect(item.body.property[0]['string']).toBe('VALUE');
        expect(item.body.property[0]['property']).toBe('NAME');
      });

      test('Shouldn`t add without string', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

        const item = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            property: [{
              property: 'NAME',
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
        const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        await Object.assign(new Element4stringEntity(), {parent, property, string: 'VALUE'}).save();

        const item = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            property: [],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.property).toHaveLength(0);
      });

      test('Should change string', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        await Object.assign(new Element4stringEntity(), {parent, property, string: 'VALUE_1'}).save();
        await Object.assign(new Element4stringEntity(), {parent, property, string: 'VALUE_2'}).save();

        const item = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            property: [{property: 'NAME', string: 'ANOTHER'}],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.property).toHaveLength(1);
        expect(item.body.property[0].property).toBe('NAME');
        expect(item.body.property[0].string).toBe('ANOTHER');
      });
    });

    describe('Content element point update', () => {
      test('Should add point', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        const item = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            property: [{property: 'NAME', point: 'LONDON'}],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.property).toHaveLength(1);
        expect(item.body.property[0].property).toBe('NAME');
        expect(item.body.property[0].point).toBe('LONDON');
        expect(item.body.property[0].directory).toBe('CITY');
      });

      test('Should remove point', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
        await Object.assign(new Element4pointEntity(), {point, parent, property}).save();

        const item = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            property: [],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.property).toHaveLength(0);
      });

      test('Should change point', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
        await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();
        await Object.assign(new Element4pointEntity(), {point, parent, property}).save();

        const item = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            property: [{property: 'NAME', point: 'PARIS'}],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.property).toHaveLength(1);
        expect(item.body.property[0].property).toBe('NAME');
        expect(item.body.property[0].point).toBe('PARIS');
        expect(item.body.property[0].directory).toBe('CITY');
      });
    });

    describe('Content element element update', () => {
      test('Should add element', async () => {
        const cookie = await createSession();
        const block = await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new PropertyEntity(), {id: 'CHILD'}).save();
        await Object.assign(new ElementEntity(), {id: 'CHILD', block}).save();

        const res = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            property: [
              {property: 'CHILD', element: 'CHILD'},
            ],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(res.body.property).toHaveLength(1);
        expect(res.body.property[0].property).toBe('CHILD');
        expect(res.body.property[0].element).toBe('CHILD');
      });

      test('Should remove element', async () => {
        const cookie = await createSession();
        const block = await new BlockEntity().save();
        const parent = await createElement();
        const property = await Object.assign(new PropertyEntity(), {id: 'CHILD'}).save();
        const element = await Object.assign(new ElementEntity(), {block}).save();
        await Object.assign(new Element4elementEntity(), {parent, property, element}).save();

        const res = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
          .send({
            id: parent.id,
            block: 1,
            property: [],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(res.body.property).toHaveLength(0);
      });
    });

    describe('Content element flag update', () => {
      test('Should add flag', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        const item = await request(app.getHttpServer())
          .put(`/element/${parent.id}`)
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
          .patch(`/element/${parent.id}`)
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
          .patch(`/element/${parent.id}`)
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
          .put(`/element/${parent.id}`)
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
          .put(`/element/${parent.id}`)
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
          .put(`/element/${parent.id}`)
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
          .put(`/element/${parent.id}`)
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
          .put(`/element/${parent.id}`)
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
          .put(`/element/${parent.id}`)
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
        .delete(`/element/${parent.id}`)
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toEqual([parent.id]);
    });

    test('Shouldn`t delete with wrong id', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await createElement();

      const list = await request(app.getHttpServer())
        .delete('/element/WRONG')
        .set('cookie', cookie)
        .expect(403);
    });
  });
});
