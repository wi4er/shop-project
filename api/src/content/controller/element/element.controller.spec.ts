import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { BlockEntity } from '../../model/block.entity';
import { ElementEntity } from '../../model/element.entity';
import { Element2stringEntity } from '../../model/element2string.entity';
import { Element2flagEntity } from '../../model/element2flag.entity';
import { DirectoryEntity } from '../../../directory/model/directory.entity';
import { PointEntity } from '../../../directory/model/point.entity';
import { Element2pointEntity } from '../../model/element2point.entity';
import { SectionEntity } from '../../model/section.entity';
import { Element2sectionEntity } from '../../model/element2section.entity';
import { PropertyEntity } from '../../../settings/model/property.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { UserEntity } from '../../../user/model/user.entity';
import { UserGroupEntity } from '../../../user/model/user-group.entity';
import { User2userGroupEntity } from '../../../user/model/user2user-group.entity';
import { ElementPermissionEntity } from '../../model/element-permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';

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
    const group = await Object.assign(new UserGroupEntity(), {}).save();
    const parent = await Object.assign(new UserEntity(), {
      login: 'USER',
      hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
    }).save();
    await Object.assign(new User2userGroupEntity(), {group, parent}).save();

    const res = await request(app.getHttpServer())
      .get('/auth')
      .set('login', 'USER')
      .set('password', 'qwerty')
      .expect(200);

    return res.headers['set-cookie'];
  }

  async function createElement(block: number = 1): Promise<ElementEntity> {
    const element = await Object.assign(new ElementEntity, {block}).save();
    await Object.assign(
      new ElementPermissionEntity(),
      {element, group: 1, method: PermissionMethod.READ},
    ).save();

    return element;
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
        const element = await Object.assign(new ElementEntity, {block: 1}).save();
        if (i % 2) await Object.assign(
          new ElementPermissionEntity(),
          {element, group: 1, method: PermissionMethod.READ},
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
        const element = await Object.assign(new ElementEntity, {block: 1}).save();
        if (i % 2) await Object.assign(
          new ElementPermissionEntity(),
          {element, group: 1, method: PermissionMethod.READ},
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
      await Object.assign(new Element2stringEntity(), {parent, property, string: 'VALUE'}).save();

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
          await Object.assign(new Element2stringEntity(), {parent, property, string: 'VALUE'}).save();
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

        await Object.assign(new Element2stringEntity(), {parent, property: property1, string: 'VALUE'}).save();
        await Object.assign(new Element2stringEntity(), {parent, property: property2, string: 'VALUE'}).save();
        await Object.assign(new Element2stringEntity(), {parent, property: property3, string: 'VALUE'}).save();
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
      await Object.assign(new Element2stringEntity(), {parent, property, string: 'VALUE'}).save();

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
          new Element2stringEntity(),
          {parent, property: name, string: `VALUE_${(Math.random() * 10 >> 0).toString().padStart(2, '0')}`},
        ).save();
        await Object.assign(
          new Element2stringEntity(),
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

      const inst = await Object.assign(new Element2pointEntity(), {parent, property, point}).save();

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
          await Object.assign(new Element2pointEntity(), {parent, property, point}).save();
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
          await Object.assign(new Element2pointEntity(), {parent, property, point}).save();
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

  describe('Content element addition', () => {
    test('Should add element', async () => {
      await new BlockEntity().save();
      const inst = await request(app.getHttpServer())
        .post('/element')
        .send({block: 1})
        .expect(201);

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
      await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {block: 1}).save();

      const item = await request(app.getHttpServer())
        .put('/element/1')
        .send({id: 1, block: 1})
        .expect(200);

      expect(item.body['id']).toBe(1);
      expect(item.body['block']).toBe(1);
      expect(item.body['version']).toBe(1);
    });

    test('Should change element block', async () => {
      await new BlockEntity().save();
      await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {block: 1}).save();

      const item = await request(app.getHttpServer())
        .put('/element/1')
        .send({id: 1, block: 2})
        .expect(200);

      expect(item.body['block']).toBe(2);
    });

    test('Should`t update without block', async () => {
      await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {block: 1}).save();

      const item = await request(app.getHttpServer())
        .put('/element/1')
        .send({id: 1})
        .expect(400);
    });

    test('Shouldn`t change with wrong id', async () => {
      await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {block: 1}).save();

      await request(app.getHttpServer())
        .put('/element/10')
        .send({id: 10})
        .expect(404);
    });

    test('Shouldn`t update without id', async () => {
      await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {block: 1}).save();

      const item = await request(app.getHttpServer())
        .put('/element')
        .send({id: 1})
        .expect(404);
    });

    test('Should add string', async () => {
      await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {block: 1}).save();
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
        .expect(200);

      expect(item.body.property).toHaveLength(1);
      expect(item.body.property[0]['string']).toBe('VALUE');
      expect(item.body.property[0]['property']).toBe('NAME');
    });

    test('Should add flag', async () => {
      await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {block: 1}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const item = await request(app.getHttpServer())
        .put('/element/1')
        .send({
          id: 1,
          block: 1,
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(item.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('Content element deletion', () => {
    test('Should delete block', async () => {
      await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {block: 1}).save();

      const list = await request(app.getHttpServer())
        .delete('/element/1')
        .expect(200);

      expect(list.body).toEqual([1]);
    });

    test('Should delete with wrong id', async () => {
      await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {block: 1}).save();

      const list = await request(app.getHttpServer())
        .delete('/element/22')
        .expect(200);

      expect(list.body).toEqual([]);
    });
  });
});
