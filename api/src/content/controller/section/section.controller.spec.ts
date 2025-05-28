import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { BlockEntity } from '../../model/block/block.entity';
import { SectionEntity } from '../../model/section/section.entity';
import { Section4stringEntity } from '../../model/section/section4string.entity';
import { Section2flagEntity } from '../../model/section/section2flag.entity';
import { DirectoryEntity } from '../../../registry/model/directory.entity';
import { PointEntity } from '../../../registry/model/point.entity';
import { Section4pointEntity } from '../../model/section/section4point.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { CollectionEntity } from '../../../storage/model/collection.entity';
import { FileEntity } from '../../../storage/model/file.entity';
import { Section2imageEntity } from '../../model/section/section2image.entity';
import { Section2permissionEntity } from '../../model/section/section2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('SectionController', () => {
  let source: DataSource;
  let app: INestApplication;

  async function createSection(id = 'SECTION'): Promise<SectionEntity> {
    await new BlockEntity().save();
    const parent = await Object.assign(new SectionEntity(), {id, block: 1}).save();
    await Object.assign(new Section2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();

    return parent;
  }

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule({imports: [AppModule]}).compile();
    app = moduleBuilder.createNestApplication();
    await app.init();

    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Content section getting', () => {
    test('Should get empty section list', async () => {
      const list = await request(app.getHttpServer())
        .get('/content/section')
        .expect(200);

      expect(list.body).toEqual([]);
    });

    test('Should get section list', async () => {
      await new BlockEntity().save();
      await Object.assign(new SectionEntity(), {id: 'SECTION', block: 1}).save();

      const list = await request(app.getHttpServer())
        .get('/content/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe('SECTION');
      expect(list.body[0].block).toBe(1);
      expect(list.body[0].sort).toBe(100);
    });

    test('Should get list with block filter', async () => {
      await new BlockEntity().save();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new SectionEntity(), {block: i % 2 + 1}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section?filter[block]=1')
        .expect(200);

      expect(list.body).toHaveLength(5);
    });

    test('Should get section item', async () => {
      await createSection();

      const item = await request(app.getHttpServer())
        .get('/content/section/SECTION')
        .expect(200);

      expect(item.body.id).toBe('SECTION');
      expect(item.body.block).toBe(1);
    });

    test('Should get section with parent', async () => {
      await new BlockEntity().save();
      const parent = await Object.assign(
        new SectionEntity(),
        {id: 'PARENT', block: 1},
      ).save();
      await Object.assign(
        new SectionEntity(),
        {id: 'CHILD', block: 1, parent},
      ).save();

      const list = await request(app.getHttpServer())
        .get('/content/section')
        .expect(200);

      expect(list.body).toHaveLength(2);
      expect(list.body[0].id).toBe('PARENT');
      expect(list.body[1].id).toBe('CHILD');
      expect(list.body[1].parent).toBe('PARENT');
    });

    test('Should get with limit', async () => {
      await new BlockEntity().save();
      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new SectionEntity(),
          {id: `SECTION_${i.toString().padStart(2, '0')}`, block: 1},
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section?limit=3')
        .expect(200);

      expect(list.body).toHaveLength(3);
      expect(list.body[0].id).toBe('SECTION_00');
      expect(list.body[1].id).toBe('SECTION_01');
      expect(list.body[2].id).toBe('SECTION_02');
    });

    test('Should get with offset', async () => {
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new SectionEntity(),
          {id: `SECTION_${i.toString().padStart(2, '0')}`, block: 1},
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section?offset=6')
        .expect(200);

      expect(list.body).toHaveLength(4);
      expect(list.body[0].id).toBe('SECTION_06');
      expect(list.body[3].id).toBe('SECTION_09');
    });
  });

  describe('Content section sorting', () => {
    test('Should get with offset', async () => {
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new SectionEntity(),
          {
            id: `SECTION_${i.toString().padStart(2, '0')}`,
            sort: 1000 - i * 100,
            block: 1,
          },
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section?sort[sort]=asc')
        .expect(200);

      expect(list.body[0].sort).toBe(100);
      expect(list.body[9].sort).toBe(1000);
    });
  });

  describe('Content section count', () => {
    test('Should get empty section count', async () => {
      const list = await request(app.getHttpServer())
        .get('/content/section/count')
        .expect(200);

      expect(list.body).toEqual({count: 0});
    });

    test('Should get section list count', async () => {
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new SectionEntity(), {block: 1}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section/count')
        .expect(200);

      expect(list.body).toEqual({count: 10});
    });

    test('Should get count with filter', async () => {
      await Object.assign(new BlockEntity(), {}).save();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new SectionEntity(), {block: i % 2 + 1}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section/count?filter[block]=1')
        .expect(200);

      expect(list.body).toEqual({count: 5});
    });
  });

  describe('Content section with strings', () => {
    test('Should get section with strings', async () => {
      const block = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      await Object.assign(new Section4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const list = await request(app.getHttpServer())
        .get('/content/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].attribute).toHaveLength(1);
      expect(list.body[0].attribute[0].string).toBe('VALUE');
      expect(list.body[0].attribute[0].attribute).toBe('NAME');
    });

    test('Should get section with lang', async () => {
      const block = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Section4stringEntity(), {parent, attribute, lang, string: 'WITH_LANG'}).save();

      const list = await request(app.getHttpServer())
        .get('/content/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].attribute).toHaveLength(1);
      expect(list.body[0].attribute[0].string).toBe('WITH_LANG');
      expect(list.body[0].attribute[0].attribute).toBe('NAME');
      expect(list.body[0].attribute[0].lang).toBe('EN');
    });
  });

  describe('Content section with images', () => {
    test('Should get section with image', async () => {
      const parent = await createSection();
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
      await Object.assign(new Section2imageEntity(), {parent, image}).save();

      const item = await request(app.getHttpServer())
        .get('/content/section/SECTION')
        .expect(200);

      expect(item.body.image).toHaveLength(1);
      expect(item.body.image[0].original).toBe('name.txt');
      expect(item.body.image[0].collection).toBe('SHORT');
      expect(item.body.image[0].path).toBe('txt/txt.txt');
    });
  });

  describe('Content section with flags', () => {
    test('Should get section with flag', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Section2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/content/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });

    test('Should get with flag list', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      for (let i = 1; i <= 5; i++) {
        const flag = await Object.assign(new FlagEntity(), {id: `ACTIVE_${i}`}).save();
        await Object.assign(new Section2flagEntity(), {parent, flag}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE_1', 'ACTIVE_2', 'ACTIVE_3', 'ACTIVE_4', 'ACTIVE_5']);
    });
  });

  describe('Content section with points', () => {
    test('Should get section with point', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Section4pointEntity(), {point, parent, attribute}).save();

      const list = await request(app.getHttpServer())
        .get('/content/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].attribute).toHaveLength(1);
      expect(list.body[0].attribute[0].attribute).toBe('CURRENT');
      expect(list.body[0].attribute[0].point).toBe('LONDON');
      expect(list.body[0].attribute[0].directory).toBe('CITY');
    });
  });

  describe('Content section flag filter', () => {
    test('Should get section with flag filter', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Section2flagEntity(), {parent, flag, string: 'VALUE'}).save();

      await Object.assign(new SectionEntity, {block}).save();

      const list = await request(app.getHttpServer())
        .get('/content/section?filter[flag][eq]=ACTIVE')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0]['flag']).toEqual(['ACTIVE']);
    });

    test('Should get empty list with flag filter', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();

      for (let i = 0; i < 10; i++) {
        const flag = await Object.assign(new FlagEntity(), {id: `ACTIVE_${i}`}).save();
        await Object.assign(new Section2flagEntity(), {parent, flag, string: 'VALUE'}).save();
      }

      await Object.assign(new SectionEntity, {block}).save();

      const list = await request(app.getHttpServer())
        .get('/content/section?filter[flag][eq]=WRONG')
        .expect(200);

      expect(list.body).toHaveLength(0);
    });
  });

  describe('Content section addition', () => {
    describe('Content section addition with parent', () => {
      test('Should add item', async () => {
        await new BlockEntity().save();

        const inst = await request(app.getHttpServer())
          .post('/content/section')
          .send({block: 1})
          .expect(201);

        expect(inst.body['parent']).toBeUndefined();
      });

      test('Should add with parent', async () => {
        await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'PARENT', block: 1}).save();

        const inst = await request(app.getHttpServer())
          .post('/content/section')
          .send({id: 'SECTION', block: 1, parent: 'PARENT'})
          .expect(201);

        expect(inst.body.id).toBe('SECTION');
        expect(inst.body.block).toBe(1);
        expect(inst.body.parent).toBe('PARENT');
      });

      test('Should add with sort', async () => {
        await new BlockEntity().save();

        const inst = await request(app.getHttpServer())
          .post('/content/section')
          .send({sort: 888, block: 1})
          .expect(201);

        expect(inst.body.sort).toBe(888);
      });

      test('Shouldn`t add with wrong parent', async () => {
        await new BlockEntity().save();

        await request(app.getHttpServer())
          .post('/content/section')
          .send({block: 1, parent: 'WRONG'})
          .expect(400);
      });
    });

    describe('Content section addition with access', () => {
      test('Should add with access', async () => {
        await new BlockEntity().save();

        const inst = await request(app.getHttpServer())
          .post('/content/section')
          .send({block: 1, permission: [{method: 'READ'}]})
          .expect(201);

        expect(inst.body.permission).toEqual([{method: 'READ'}]);
      });

      test('Shouldn`t add with wrong method', async () => {
        await new BlockEntity().save();

        await request(app.getHttpServer())
          .post('/content/section')
          .send({block: 1, permission: [{method: 'WRONG'}]})
          .expect(400);
      });

      test('Should add with group access', async () => {
        await new BlockEntity().save();
        await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();

        const inst = await request(app.getHttpServer())
          .post('/content/section')
          .send({
            block: 1,
            permission: [
              {method: 'READ'},
              {method: 'READ', group: 'GROUP'},
            ],
          })
          .expect(201);

        expect(inst.body.permission).toContainEqual({method: 'READ', group: 'GROUP'});
      });

      test('Shouldn`t add with  wrong group', async () => {
        await new BlockEntity().save();
        await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();

        await request(app.getHttpServer())
          .post('/content/section')
          .send({
            block: 1,
            permission: [
              {method: 'READ'},
              {method: 'READ', group: 'WRONG'},
            ],
          })
          .expect(400);
      });

      test('Should add and read with access', async () => {
        await new BlockEntity().save();

        await request(app.getHttpServer())
          .post('/content/section')
          .send({id: 'SECTION', block: 1, permission: [{method: 'READ'}]})
          .expect(201);

        const inst = await request(app.getHttpServer())
          .get('/content/section/SECTION')
          .expect(200);

        expect(inst.body.permission).toEqual([{method: 'READ'}]);
      });
    });

    describe('Content section addition with string', () => {
      test('Should add with strings', async () => {
        await new BlockEntity().save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        const inst = await request(app.getHttpServer())
          .post('/content/section')
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

      test('Should add with lang', async () => {
        await new BlockEntity().save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new LangEntity(), {id: 'EN'}).save();

        const inst = await request(app.getHttpServer())
          .post('/content/section')
          .send({
            block: 1,
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
        await new BlockEntity().save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        await request(app.getHttpServer())
          .post('/content/section')
          .send({
            block: 1,
            attribute: [
              {attribute: 'WRONG', string: 'VALUE'},
            ],
          })
          .expect(400);
      });

      test('Shouldn`t add with wrong lang', async () => {
        await new BlockEntity().save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new LangEntity(), {id: 'EN'}).save();

        await request(app.getHttpServer())
          .post('/content/section')
          .send({
            block: 1,
            attribute: [
              {attribute: 'NAME', string: 'VALUE', lang: 'WRONG'},
            ],
          })
          .expect(400);
      });
    });

    describe('Content section addition with flag', () => {
      test('Should add with flags', async () => {
        await new BlockEntity().save();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        const inst = await request(app.getHttpServer())
          .post('/content/section')
          .send({
            block: 1,
            flag: ['ACTIVE'],
          })
          .expect(201);

        expect(inst.body.flag).toEqual(['ACTIVE']);
      });

      test('Shouldn`t add with wrong flags', async () => {
        await new BlockEntity().save();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        await request(app.getHttpServer())
          .post('/content/section')
          .send({
            block: 1,
            flag: ['WRONG'],
          })
          .expect(400);
      });
    });

    describe('Content section addition with image', () => {
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
          .post('/content/section')
          .send({block: 1, image: [1]})
          .expect(201);

        expect(inst.body.image).toHaveLength(1);
        expect(inst.body.image[0].image).toBe(1);
        expect(inst.body.image[0].collection).toBe('SHORT');
        expect(inst.body.image[0].path).toBe('txt/txt.txt');
      });

      test('Shouldn`t add with wrong image', async () => {
        const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
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

        await request(app.getHttpServer())
          .post('/content/section')
          .send({block: 1, image: [555]})
          .expect(400);
      });
    });

    describe('Content section addition with block', () => {
      test('Shouldn`t add section without block', async () => {
        await request(app.getHttpServer())
          .post('/content/section')
          .send({})
          .expect(400);
      });

      test('Shouldn`t add with wrong block', async () => {
        await new BlockEntity().save();
        await request(app.getHttpServer())
          .post('/content/section')
          .send({block: 2})
          .expect(400);
      });
    });
  });

  describe('Content section updating', () => {
    describe('Content section fields update', () => {
      test('Should update id', async () => {
        await createSection();

        const inst = await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({id: 'UPDATED', block: 1})
          .expect(200);

        expect(inst.body.id).toEqual('UPDATED');
      });

      test('Shouldn`t update to blank', async () => {
        await createSection();

        await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({id: '', block: 1})
          .expect(400);
      });

      test('Should update sort', async () => {
        await createSection();

        const inst = await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({id: 'SECTION', sort: 777, block: 1})
          .expect(200);

        expect(inst.body.sort).toBe(777);
      });
    });

    describe('Content section update with block', () => {
      test('Should update item', async () => {
        await createSection();

        const inst = await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({id: 'SECTION', block: 1})
          .expect(200);

        expect(inst.body.id).toEqual('SECTION');
      });

      test('Shouldn`t update without block', async () => {
        await createSection();

        await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({})
          .expect(400);
      });

      test('Shouldn`t update with wrong block', async () => {
        await createSection();

        await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({block: 999})
          .expect(400);
      });
    });

    describe('Content section update with access', () => {
      test('Should update access', async () => {
        await createSection();

        const inst = await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({id: 'SECTION', block: 1, permission: [{method: 'READ'}]})
          .expect(200);

        expect(inst.body.permission).toEqual([{method: 'READ'}]);
      });

      test('Shouldn`t update with wrong method', async () => {
        await createSection();

        await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({id: 'SECTION', block: 1, permission: [{method: 'WRONG'}]})
          .expect(400);
      });

      test('Should add group access', async () => {
        await createSection();
        await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();

        const inst = await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({
            id: 'SECTION',
            block: 1,
            permission: [
              {method: 'ALL'},
              {method: 'READ', group: 'GROUP'},
            ]
          })
          .expect(200);

        expect(inst.body.permission).toContainEqual({method: 'READ', group: 'GROUP'});
      });

      test('Shouldn`t update with wrong goup', async () => {
        await createSection();

        await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({id: 'SECTION', block: 1, permission: [{method: 'READ', group: 'WRONG'}]})
          .expect(400);
      });
    });

    describe('Content section update with image', () => {
      test('Should add image', async () => {
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
        await createSection();

        const inst = await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({id: 'SECTION', block: 1, image: [1]})
          .expect(200);

        expect(inst.body.image).toHaveLength(1);
        expect(inst.body.image[0].original).toBe('name.txt');
        expect(inst.body.image[0].path).toBe('txt/txt.txt');
      });

      test('Should remove image', async () => {
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

        const parent = await createSection();
        await Object.assign(new Section2imageEntity(), {parent, image}).save();

        const inst = await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({id: 'SECTION', block: 1, image: []})
          .expect(200);

        expect(inst.body.image).toHaveLength(0);
      });
    });

    describe('Content section update with parent', () => {
      test('Should update parent', async () => {
        await createSection();
        const parent = await Object.assign(new SectionEntity(), {id: 'CHILD', block: 1}).save();
        await Object.assign(new Section2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();

        const inst = await request(app.getHttpServer())
          .put('/content/section/CHILD')
          .send({id: 'CHILD', block: 1, parent: 'SECTION'})
          .expect(200);

        expect(inst.body.id).toBe('CHILD');
        expect(inst.body.parent).toBe('SECTION');
      });

      test('Shouldn`t update with wrong parent', async () => {
        const block = await new BlockEntity().save();
        const parent = await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();
        await Object.assign(new Section2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();

        await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({id: 'SECTION', block: 1, parent: 'WRONG'})
          .expect(400);
      });
    });

    describe('Content section with strings', () => {
      test('Should add strings', async () => {
        await createSection();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        const inst = await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({
            id: 'SECTION',
            block: 1,
            attribute: [
              {attribute: 'NAME', string: 'VALUE'},
            ],
          })
          .expect(200);

        expect(inst.body.attribute).toHaveLength(1);
        expect(inst.body.attribute[0].attribute).toBe('NAME');
        expect(inst.body.attribute[0].string).toBe('VALUE');
      });

      test('Should remove strings', async () => {
        const parent = await createSection();
        const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new Section4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

        const inst = await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({
            id: 'SECTION',
            block: 1,
            attribute: [],
          })
          .expect(200);

        expect(inst.body.attribute).toHaveLength(0);
      });
    });

    describe('Content section with flags', () => {
      test('Should add flag', async () => {
        await createSection();
        await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

        const inst = await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({
            id: 'SECTION',
            block: 1,
            flag: ['NEW'],
          })
          .expect(200);

        expect(inst.body.flag).toEqual(['NEW']);
      });

      test('Should update flags only', async () => {
        await createSection();
        await Object.assign(new FlagEntity(), {id: 'FLAG_1'}).save();
        await Object.assign(new FlagEntity(), {id: 'FLAG_2'}).save();

        const inst = await request(app.getHttpServer())
          .patch('/content/section/SECTION')
          .send({
            flag: ['FLAG_1', 'FLAG_2'],
          })
          .expect(200);

        expect(inst.body.flag).toEqual(['FLAG_1', 'FLAG_2']);
      });

      test('Should remove flags', async () => {
        const parent = await createSection();
        const flag = await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
        await Object.assign(new Section2flagEntity(), {parent, flag}).save();

        const inst = await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({
            id: 'SECTION',
            block: 1,
            flag: [],
          })
          .expect(200);

        expect(inst.body.flag).toEqual([]);
      });

      test('Shouldn`t add wrong flag', async () => {
        await createSection();
        await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

        await request(app.getHttpServer())
          .put('/content/section/SECTION')
          .send({
            id: 'SECTION',
            block: 1,
            flag: ['WRONG'],
          })
          .expect(400);
      });
    });
  });

  describe('Content section deletion', () => {
    test('Should delete section', async () => {
      await createSection();

      const inst = await request(app.getHttpServer())
        .delete('/content/section/SECTION')
        .expect(200);

      expect(inst.body).toEqual(['SECTION']);
    });

    test('Shouldn`t delete with wrong ID', async () => {
      await createSection();

      await request(app.getHttpServer())
        .delete('/content/section/WRONG')
        .expect(404);
    });

    test('Shouldn`t delete without permission', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();

      await request(app.getHttpServer())
        .delete('/content/section/SECTION')
        .expect(403);
    });

    test('Shouldn`t delete without DELETE permission', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();
      await Object.assign(new Section2permissionEntity(), {parent, method: PermissionMethod.READ}).save();
      await Object.assign(new Section2permissionEntity(), {parent, method: PermissionMethod.WRITE}).save();

      await request(app.getHttpServer())
        .delete('/content/section/SECTION')
        .expect(403);
    });
  });
});
