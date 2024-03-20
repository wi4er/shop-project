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
    const group = await Object.assign(new GroupEntity(), {}).save();
    const parent = await Object.assign(new UserEntity(), {
      login: 'USER',
      hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
    }).save();
    await Object.assign(new User2groupEntity(), {group, parent}).save();

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
      {parent, group: 1, method: PermissionMethod.ALL},
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
      expect(list.body[0].id).toBe(1);
      expect(list.body[9].id).toBe(10);
    });

    test('Should get element with permission', async () => {
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
      expect(list.body[0].id).toBe(1);
      expect(list.body[1].id).toBe(3);
      expect(list.body[2].id).toBe(5);
      expect(list.body[3].id).toBe(7);
      expect(list.body[4].id).toBe(9);
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
      expect(list.body[0].id).toBe(6);
      expect(list.body[4].id).toBe(10);
    });

    test('Should get list with limit', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) await createElement();

      const list = await request(app.getHttpServer())
        .get('/element?limit=5')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(5);
      expect(list.body[0].id).toBe(1);
      expect(list.body[4].id).toBe(5);
    });
  });

  describe('Content element item', () => {
    test('Should get element item', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await createElement();

      const list = await request(app.getHttpServer())
        .get('/element/1')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body.id).toBe(1);
      expect(list.body.block).toBe(1);
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
      await Object.assign(new ElementEntity, {block: 1}).save();

      await request(app.getHttpServer())
        .get('/element/1')
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

    test('Should get element with permission count', async () => {
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
      expect(list.body[0].id).toBe(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].string).toBe('VALUE');
      expect(list.body[0].property[0].property).toBe('NAME');
    });

    test('Should get elements list with many properties', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
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
      expect(list.body[0].id).toBe(1);
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

      for (let i = 0; i < 10; i++) {
        const parent = await createElement();

        await Object.assign(new Element4stringEntity(), {parent, property: property1, string: 'VALUE'}).save();
        await Object.assign(new Element4stringEntity(), {parent, property: property2, string: 'VALUE'}).save();
        await Object.assign(new Element4stringEntity(), {parent, property: property3, string: 'VALUE'}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/element?limit=3')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(3);
      expect(list.body[0].id).toBe(1);
      expect(list.body[1].id).toBe(2);
      expect(list.body[2].id).toBe(3);
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
      expect(list.body[0].id).toBe(2);
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
      const section = await Object.assign(new SectionEntity(), {block}).save();
      await Object.assign(new Element2sectionEntity(), {parent, section}).save();

      const list = await request(app.getHttpServer())
        .get('/element')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe(1);
      expect(list.body[0].section).toHaveLength(1);
      expect(list.body[0].section[0]).toBe(1);
    });

    test('Should get elements list with sections', async () => {
      const cookie = await createSession();
      const block = await new BlockEntity().save();
      const parent1 = await createElement();
      const parent2 = await createElement();
      const section1 = await Object.assign(new SectionEntity(), {block}).save();
      const section2 = await Object.assign(new SectionEntity(), {block}).save();

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
      expect(list.body[0].section[0]).toBe(1);
      expect(list.body[0].section[1]).toBe(2);
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
      const element = await Object.assign(new ElementEntity(), {block}).save();

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
      expect(list.body[0].property[0].element).toBe(2);
    });
  });

  describe('Content element addition', () => {
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

      expect(inst.body.id).toBe(1);
      expect(inst.body.block).toBe(1);
      expect(inst.body.permission[0].method).toBe('READ');
      expect(inst.body.permission[0].group).toBe(1);
    });

    test('Shouldn`t add with wrong group', async () => {
      const parent = await Object.assign(new UserEntity(), {
        login: 'USER',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();

      const {headers} = await request(app.getHttpServer())
        .post('/auth')
        .send({
          login: 'USER',
          password: 'qwerty',
        })
        .expect(201);

      await new BlockEntity().save();
      const inst = await request(app.getHttpServer())
        .post('/element')
        .send({
          block: 1,
          permission: [{group: 777, method: 'READ'}],
        })
        .set('cookie', headers['set-cookie'])
        .expect(400);
    });

    test('Should add and get element', async () => {
      const cookie = await createSession();

      await new BlockEntity().save();
      await request(app.getHttpServer())
        .post('/element')
        .send({
          block: 1,
          permission: [{group: 1, method: 'READ'}],
        })
        .set('cookie', cookie)
        .expect(201);

      const inst = await request(app.getHttpServer())
        .get('/element/1')
        .set('cookie', cookie)
        .expect(200);

      expect(inst.body['id']).toBe(1);
      expect(inst.body['block']).toBe(1);
    });

    test('Shouldn`t add without block', async () => {
      const inst = await request(app.getHttpServer())
        .post('/element')
        .send({})
        .expect(400);
    });

    test('Shouldn`t add with wrong block', async () => {
      await new BlockEntity().save();
      await request(app.getHttpServer())
        .post('/element')
        .send({block: 2})
        .expect(400);
    });

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

    test('Should add with element', async () => {
      const block = await new BlockEntity().save();
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new ElementEntity(), {block}).save();

      const inst = await request(app.getHttpServer())
        .post('/element')
        .send({
          block: 1,
          property: [
            {property: 'NAME', element: 2},
          ],
        })
        .expect(201);

      expect(inst.body.property).toHaveLength(1);
      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].element).toBe(2);
    });

    test('Shouldn`t add with wrong property', async () => {
      await new BlockEntity().save();
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/element')
        .send({
          block: 1,
          property: [
            {property: 'WRONG', string: 'VALUE'},
          ],
        })
        .expect(400);
    });

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
  });

  describe('Content element update', () => {
    test('Should update item', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await createElement();

      const item = await request(app.getHttpServer())
        .put('/element/1')
        .send({id: 1, block: 1})
        .set('cookie', cookie)
        .expect(200);

      expect(item.body['id']).toBe(1);
      expect(item.body['block']).toBe(1);
    });

    test('Should change element block', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await new BlockEntity().save();
      await createElement();

      const item = await request(app.getHttpServer())
        .put('/element/1')
        .send({id: 1, block: 2})
        .set('cookie', cookie)
        .expect(200);

      expect(item.body['block']).toBe(2);
    });

    test('Should`t update without block', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await createElement();

      const item = await request(app.getHttpServer())
        .put('/element/1')
        .send({id: 1})
        .set('cookie', cookie)
        .expect(400);
    });

    test('Shouldn`t change with wrong id', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await createElement();

      await request(app.getHttpServer())
        .put('/element/10')
        .send({id: 10})
        .set('cookie', cookie)
        .expect(403);
    });

    test('Shouldn`t update without id', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await createElement();

      const item = await request(app.getHttpServer())
        .put('/element')
        .send({id: 1})
        .set('cookie', cookie)
        .expect(404);
    });

    describe('Content element string update', () => {
      test('Should add string', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        await createElement();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

        const item = await request(app.getHttpServer())
          .put('/element/1')
          .send({
            id: 1,
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
        await createElement();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

        const item = await request(app.getHttpServer())
          .put('/element/1')
          .send({
            id: 1,
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
          .put('/element/1')
          .send({
            id: 1,
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
          .put('/element/1')
          .send({
            id: 1,
            block: 1,
            property: [{property: 'NAME', string: 'ANOTHER'}],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.property).toHaveLength(1);
        expect(item.body.property[0].property).toBe('NAME')
        expect(item.body.property[0].string).toBe('ANOTHER')
      });
    });

    describe('Content element point update', () => {
      test('Should add point', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        await createElement();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        const item = await request(app.getHttpServer())
          .put('/element/1')
          .send({
            id: 1,
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
          .put('/element/1')
          .send({
            id: 1,
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
          .put('/element/1')
          .send({
            id: 1,
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
        await createElement();
        await Object.assign(new PropertyEntity(), {id: 'CHILD'}).save();
        await Object.assign(new ElementEntity(), {block}).save();

        const res = await request(app.getHttpServer())
          .put('/element/1')
          .send({
            id: 1,
            block: 1,
            property: [
              {property: 'CHILD', element: 2}
            ],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(res.body.property).toHaveLength(1);
        expect(res.body.property[0].property).toBe('CHILD');
        expect(res.body.property[0].element).toBe(2);
      });

      test('Should remove element', async () => {
        const cookie = await createSession();
        const block = await new BlockEntity().save();
        const parent = await createElement();
        const property = await Object.assign(new PropertyEntity(), {id: 'CHILD'}).save();
        const element = await Object.assign(new ElementEntity(), {block}).save();
        await Object.assign(new Element4elementEntity(), {parent, property, element}).save();

        const res = await request(app.getHttpServer())
          .put('/element/1')
          .send({
            id: 1,
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
        await createElement();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        const item = await request(app.getHttpServer())
          .put('/element/1')
          .send({
            id: 1,
            block: 1,
            flag: ['ACTIVE'],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.flag).toEqual(['ACTIVE']);
      });

      test('Should remove flag', async () => {
        const cookie = await createSession();
        await new BlockEntity().save();
        const parent = await createElement();
        const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
        await Object.assign(new Element2flagEntity(), {parent, flag}).save();

        const item = await request(app.getHttpServer())
          .put('/element/1')
          .send({
            id: 1,
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
          .put('/element/1')
          .send({
            id: 1,
            block: 1,
            flag: ['UPDATED'],
          })
          .set('cookie', cookie)
          .expect(200);

        expect(item.body.flag).toEqual(['UPDATED']);
      });
    });
  });

  describe('Content element deletion', () => {
    test('Should delete block', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await createElement();

      const list = await request(app.getHttpServer())
        .delete('/element/1')
        .set('cookie', cookie)
        .expect(200);

      expect(list.body).toEqual([1]);
    });

    test('Shouldn`t delete with wrong id', async () => {
      const cookie = await createSession();
      await new BlockEntity().save();
      await createElement();

      const list = await request(app.getHttpServer())
        .delete('/element/22')
        .set('cookie', cookie)
        .expect(403);
    });
  });
});
