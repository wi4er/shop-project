import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { BlockEntity } from '../../model/block/block.entity';
import { ElementEntity } from '../../model/element/element.entity';
import { Element4stringEntity } from '../../model/element/element4string.entity';
import { Element2flagEntity } from '../../model/element/element2flag.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { Element4pointEntity } from '../../model/element/element4point.entity';
import { SectionEntity } from '../../model/section/section.entity';
import { Element2sectionEntity } from '../../model/element/element2section.entity';
import { AttributeEntity, AttributeType } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { UserEntity } from '../../../personal/model/user/user.entity';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { User2groupEntity } from '../../../personal/model/user/user2group.entity';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { Element4elementEntity } from '../../model/element/element4element.entity';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { Element2imageEntity } from '../../model/element/element2image.entity';
import { FileEntity } from '../../../storage/model/file/file.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Element4descriptionEntity } from '../../model/element/element4description.entity';
import { Element4IntervalEntity } from '../../model/element/element4interval.entity';
import { Element4counterEntity } from '../../model/element/element4counter.entity';

describe('Element Controller', () => {
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
      const block1 = await new BlockEntity('BLOCK_1').save();
      const block2 = await new BlockEntity('BLOCK_2').save();

      for (let i = 0; i < 10; i++) {
        await createElement().withBlock(i % 2 === 1 ? block1 : block2);
      }

      const list = await request(app.getHttpServer())
        .get('/content/element?filter[block]=BLOCK_1')
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

  describe('Content element with fields', () => {
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

        await createElement('ELEMENT')
          .withBlock(await new BlockEntity().save());

        const item = await request(app.getHttpServer())
          .get(`/content/element/ELEMENT`)
          .expect(200);

        expect(item.body.id).toBe('ELEMENT');
        expect(item.body.created_at).toBeDefined();
        expect(item.body.updated_at).toBeDefined();
        expect(item.body.version).toBe(1);
        expect(item.body.sort).toBe(100);
        expect(item.body.block).toHaveLength(36);
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
  });

  describe('Content element with attributes', () => {
    describe('Content element with strings', () => {
      test('Should get elements with strings', async () => {
        const block = await new BlockEntity().save();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const parent = await createElement().withBlock(block);
        await Object.assign(new Element4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

        const list = await request(app.getHttpServer())
          .get('/content/element')
          .expect(200);

        expect(list.body).toHaveLength(1);
        expect(list.body[0].attribute).toHaveLength(1);
        expect(list.body[0].attribute[0].string).toBe('VALUE');
        expect(list.body[0].attribute[0].attribute).toBe('NAME');
      });

      test('Should get elements list with many properties', async () => {
        const cookie = await createSession();
        const block = await new BlockEntity('BLOCK').save();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        for (let i = 0; i < 10; i++) {
          const parent = await createElement()
            .withBlock(block);

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
          const parent = await createElement(`ELEMENT_${i.toString().padStart(2, '0')}`)
            .withBlock(block);

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

        await createElement().withBlock(block);
        const parent = await createElement().withBlock(block);
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
        const block = await new BlockEntity().save();
        const name = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const gender = await Object.assign(new AttributeEntity(), {id: 'GENDER'}).save();

        for (let i = 0; i < 10; i++) {
          const parent = await createElement().withBlock(block);
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
          .expect(200);


        // console.dir(list.body, { depth: 5 });
        // expect(list.body).toHaveLength(1);
        // expect(list.body[0].id).toBe(2);
        // expect(list.body[0].attribute).toHaveLength(1);
        // expect(list.body[0].attribute[0].string).toBe('VALUE');
        // expect(list.body[0].attribute[0].attribute).toBe('NAME');
      });
    });

    describe('Content element with description', () => {
      test('Should get with description', async () => {
        const block = await new BlockEntity().save();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'TEXT'}).save();
        const parent = await createElement('ELEMENT').withBlock(block);
        await Object.assign(new Element4descriptionEntity(), {parent, attribute, description: 'something'}).save();

        const item = await request(app.getHttpServer())
          .get('/content/element/ELEMENT')
          .expect(200);

        expect(item.body.attribute).toEqual([{description: 'something', attribute: 'TEXT'}]);
      });
    });

    describe('Content element with section', () => {
      test('Should get elements with section', async () => {
        const block = await new BlockEntity().save();
        const parent = await createElement().withBlock(block);
        const section = await Object.assign(new SectionEntity(), {id: '1', block}).save();
        await Object.assign(new Element2sectionEntity(), {parent, section}).save();

        const list = await request(app.getHttpServer())
          .get('/content/element')
          .expect(200);

        expect(list.body).toHaveLength(1);
        expect(list.body[0].section).toHaveLength(1);
        expect(list.body[0].section[0]).toBe('1');
      });

      test('Should get elements list with sections', async () => {
        const block = await new BlockEntity().save();
        const parent1 = await createElement().withBlock(block);
        const parent2 = await createElement().withBlock(block);
        const section1 = await Object.assign(new SectionEntity(), {id: '1', block}).save();
        const section2 = await Object.assign(new SectionEntity(), {id: '2', block}).save();

        await Object.assign(new Element2sectionEntity(), {parent: parent1, section: section1}).save();
        await Object.assign(new Element2sectionEntity(), {parent: parent1, section: section2}).save();
        await Object.assign(new Element2sectionEntity(), {parent: parent2, section: section1}).save();
        await Object.assign(new Element2sectionEntity(), {parent: parent2, section: section2}).save();

        const list = await request(app.getHttpServer())
          .get('/content/element')
          .expect(200);

        expect(list.body).toHaveLength(2);
        expect(list.body[0].section).toHaveLength(2);
        expect(list.body[0].section[0]).toBe('1');
        expect(list.body[0].section[1]).toBe('2');
      });
    });

    describe('Content element with flags', () => {
      test('Should get element with flag', async () => {
        const block = await new BlockEntity().save();
        const parent = await createElement().withBlock(block);
        const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
        await Object.assign(new Element2flagEntity(), {parent, flag}).save();

        const list = await request(app.getHttpServer())
          .get('/content/element')
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

        await Object.assign(new ElementEntity, {id: 'BLANK', block}).save();

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
        const block = await new BlockEntity().save();
        const parent = await createElement().withBlock(block);
        const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        await Object.assign(new Element4pointEntity(), {parent, attribute, point}).save();

        const list = await request(app.getHttpServer())
          .get('/content/element')
          .expect(200);

        expect(list.body).toHaveLength(1);
        expect(list.body[0].attribute).toHaveLength(1);
        expect(list.body[0].attribute[0].point).toBe('LONDON');
        expect(list.body[0].attribute[0].directory).toBe('CITY');
      });

      test('Should get element with point filter', async () => {
        const block = await new BlockEntity().save();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        for (let i = 0; i < 10; i++) {
          const parent = await createElement().withBlock(block);

          if (i % 2) {
            await Object.assign(new Element4pointEntity(), {parent, attribute, point}).save();
          }
        }

        const list = await request(app.getHttpServer())
          .get('/content/element?filter[point][CITY][eq]=LONDON')
          .expect(200);

        expect(list.body).toHaveLength(5);
        expect(list.body[0].attribute).toHaveLength(1);
        expect(list.body[0].attribute[0].point).toBe('LONDON');
        expect(list.body[0].attribute[0].directory).toBe('CITY');
      });

      test('Should get element with point order', async () => {
        const block = await new BlockEntity().save();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        for (let i = 0; i < 10; i++) {
          const parent = await createElement().withBlock(block);

          if (i % 2) {
            await Object.assign(new Element4pointEntity(), {parent, attribute, point}).save();
          }
        }

        const list = await request(app.getHttpServer())
          .get('/content/element?sort[point][CITY]=asc')
          .expect(200);

        // expect(list.body).toHaveLength(5);
        // expect(list.body[0].attribute).toHaveLength(1);
        // expect(list.body[0].attribute[0].value).toBe('LONDON');
        // expect(list.body[0].attribute[0].registry).toBe('CITY');
      });
    });

    describe('Content element with counter', () => {
      test('Should get item with counter', async () => {
        const block = await new BlockEntity().save();
        const parent = await createElement().withBlock(block);
        const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

        await Object.assign(new Element4counterEntity(), {parent, attribute, point, count: 100}).save();

        const list = await request(app.getHttpServer())
          .get('/content/element')
          .expect(200);

        expect(list.body).toHaveLength(1);
        expect(list.body[0].attribute).toHaveLength(1);
        expect(list.body[0].attribute[0].counter).toBe('LONDON');
        expect(list.body[0].attribute[0].directory).toBe('CITY');
        expect(list.body[0].attribute[0].count).toBe(100);
      });
    });

    describe('Content element with element', () => {
      test('Should get element with element', async () => {
        const cookie = await createSession();
        const block = await new BlockEntity().save();
        const parent = await createElement('PARENT').withBlock(block);
        const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
        const element = await createElement('CHILD').withBlock(block);

        await Object.assign(
          new Element4elementEntity(),
          {parent, attribute, element},
        ).save();

        const list = await request(app.getHttpServer())
          .get('/content/element/PARENT')
          .set('cookie', cookie)
          .expect(200);

        expect(list.body.attribute).toEqual([{attribute: 'CURRENT', element: 'CHILD'}]);
      });
    });
  });
});
