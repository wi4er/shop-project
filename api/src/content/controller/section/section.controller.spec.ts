import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { BlockEntity } from '../../model/block.entity';
import { SectionEntity } from '../../model/section.entity';
import { Section4stringEntity } from '../../model/section4string.entity';
import { Section2flagEntity } from '../../model/section2flag.entity';
import { DirectoryEntity } from '../../../directory/model/directory.entity';
import { PointEntity } from '../../../directory/model/point.entity';
import { Section4pointEntity } from '../../model/section4point.entity';
import { PropertyEntity } from '../../../settings/model/property.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { CollectionEntity } from '../../../storage/model/collection.entity';
import { FileEntity } from '../../../storage/model/file.entity';
import { Section2imageEntity } from '../../model/section2image.entity';

describe('SectionController', () => {
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

  describe('Content section getting', () => {
    test('Should get empty section list', async () => {
      const list = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(list.body).toEqual([]);
    });

    test('Should get section list', async () => {
      await new BlockEntity().save();
      await Object.assign(new SectionEntity(), {id: 'SECTION', block: 1}).save();

      const list = await request(app.getHttpServer())
        .get('/section')
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
        .get('/section?filter[block]=1')
        .expect(200);

      expect(list.body).toHaveLength(5);
    });

    test('Should get section item', async () => {
      await new BlockEntity().save();
      await Object.assign(new SectionEntity(), {id: 'SECTION', block: 1}).save();

      const list = await request(app.getHttpServer())
        .get('/section/SECTION')
        .expect(200);

      expect(list.body.id).toBe('SECTION');
      expect(list.body.block).toBe(1);
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
        .get('/section')
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
        .get('/section?limit=3')
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
        .get('/section?offset=6')
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
            block: 1
          },
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/section?sort[sort]=asc')
        .expect(200);

      expect(list.body[0].sort).toBe(100);
      expect(list.body[9].sort).toBe(1000);
    });
  });

  describe('Content section empty count', () => {
    test('Should get empty section count', async () => {
      const list = await request(app.getHttpServer())
        .get('/section/count')
        .expect(200);

      expect(list.body).toEqual({count: 0});
    });

    test('Should get section list count', async () => {
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new SectionEntity(), {block: 1}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/section/count')
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
        .get('/section/count?filter[block]=1')
        .expect(200);

      expect(list.body).toEqual({count: 5});
    });
  });

  describe('Content section with strings', () => {
    test('Should get section with strings', async () => {
      const block = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      await Object.assign(new Section4stringEntity(), {parent, property, string: 'VALUE'}).save();

      const list = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].string).toBe('VALUE');
      expect(list.body[0].property[0].property).toBe('NAME');
    });

    test('Should get section with lang', async () => {
      const block = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Section4stringEntity(), {parent, property, lang, string: 'WITH_LANG'}).save();

      const list = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].string).toBe('WITH_LANG');
      expect(list.body[0].property[0].property).toBe('NAME');
      expect(list.body[0].property[0].lang).toBe('EN');
    });
  });

  describe('Content section with images', () => {
    test('Should get section with image', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new SectionEntity(),
        {id: 'SECTION', block}
      ).save();
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
        .get('/section/SECTION')
        .expect(200);

      expect(item.body.image).toHaveLength(1);
      expect(item.body.image[0].original).toBe('name.txt')
      expect(item.body.image[0].collection).toBe('SHORT')
      expect(item.body.image[0].path).toBe('txt/txt.txt')
    });
  });

  describe('Content section with flags', () => {
    test('Should get section with flag', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Section2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/section')
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
        .get('/section')
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
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Section4pointEntity(), {point, parent, property}).save();

      const list = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].property).toBe('CURRENT');
      expect(list.body[0].property[0].point).toBe('LONDON');
      expect(list.body[0].property[0].directory).toBe('CITY');
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
        .get('/section?filter[flag][eq]=ACTIVE')
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
        .get('/section?filter[flag][eq]=WRONG')
        .expect(200);

      expect(list.body).toHaveLength(0);
    });
  });

  describe('Content section addition', () => {
    describe('Content section addition with parent', () => {
      test('Should add item', async () => {
        await new BlockEntity().save();

        const inst = await request(app.getHttpServer())
          .post('/section')
          .send({block: 1})
          .expect(201);

        expect(inst.body['parent']).toBeUndefined();
      });

      test('Should add with parent', async () => {
        await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'PARENT', block: 1}).save();

        const inst = await request(app.getHttpServer())
          .post('/section')
          .send({id: 'SECTION', block: 1, parent: 'PARENT'})
          .expect(201);

        expect(inst.body.id).toBe('SECTION');
        expect(inst.body.block).toBe(1);
        expect(inst.body.parent).toBe('PARENT');
      });

      test('Should add with sort', async () => {
        await new BlockEntity().save();

        const inst = await request(app.getHttpServer())
          .post('/section')
          .send({sort: 888, block: 1})
          .expect(201);

        expect(inst.body.sort).toBe(888);
      });

      test('Shouldn`t add with wrong parent', async () => {
        await new BlockEntity().save();

        await request(app.getHttpServer())
          .post('/section')
          .send({block: 1, parent: 'WRONG'})
          .expect(400);
      });
    });

    describe('Content section addition with', () => {
      test('Should add with image', async () => {
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
        await Object.assign(new SectionEntity(), {block: 1}).save();

        const inst = await request(app.getHttpServer())
          .post('/section')
          .send({block: 1, image: [1]})
          .expect(201);

        expect(inst.body.image).toHaveLength(1);
        expect(inst.body.image[0].image).toBe(1);
        expect(inst.body.image[0].collection).toBe('SHORT');
      });

      test('Shouldn`t add with wrong image', async () => {
        await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {block: 1}).save();

        await request(app.getHttpServer())
          .post('/section')
          .send({block: 1, image: [777]})
          .expect(400);
      });
    });

    describe('Content section addition with string property', () => {
      test('Should add with strings', async () => {
        await new BlockEntity().save();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

        const inst = await request(app.getHttpServer())
          .post('/section')
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

      test('Should add with lang', async () => {
        await new BlockEntity().save();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        await Object.assign(new LangEntity(), {id: 'EN'}).save();

        const inst = await request(app.getHttpServer())
          .post('/section')
          .send({
            block: 1,
            property: [
              {property: 'NAME', string: 'VALUE', lang: 'EN'},
            ],
          })
          .expect(201);

        expect(inst.body.property).toHaveLength(1);
        expect(inst.body.property[0].property).toBe('NAME');
        expect(inst.body.property[0].string).toBe('VALUE');
        expect(inst.body.property[0].lang).toBe('EN');
      });

      test('Shouldn`t add with wrong property', async () => {
        await new BlockEntity().save();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

        await request(app.getHttpServer())
          .post('/section')
          .send({
            block: 1,
            property: [
              {property: 'WRONG', string: 'VALUE'},
            ],
          })
          .expect(400);
      });

      test('Shouldn`t add with wrong lang', async () => {
        await new BlockEntity().save();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        await Object.assign(new LangEntity(), {id: 'EN'}).save();

        await request(app.getHttpServer())
          .post('/section')
          .send({
            block: 1,
            property: [
              {property: 'NAME', string: 'VALUE', lang: 'WRONG'},
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
          .post('/section')
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
          .post('/section')
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
          .post('/section')
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
          .post('/section')
          .send({block: 1, image: [555]})
          .expect(400);
      });
    });

    describe('Content section addition with block', () => {
      test('Shouldn`t add section without block', async () => {
        const inst = await request(app.getHttpServer())
          .post('/section')
          .send({})
          .expect(400);
      });

      test('Shouldn`t add with wrong block', async () => {
        await new BlockEntity().save();
        await request(app.getHttpServer())
          .post('/section')
          .send({block: 2})
          .expect(400);
      });
    });
  });

  describe('Content section updating', () => {
    describe('Content section fields update', () => {
      test('Should update id', async () => {
        const block = await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();

        const inst = await request(app.getHttpServer())
          .put('/section/SECTION')
          .send({id: 'UPDATED', block: 1})
          .expect(200);

        expect(inst.body.id).toEqual('UPDATED');
      });

      test('Shouldn`t update to blank', async () => {
        const block = await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();

        const item = await request(app.getHttpServer())
          .put('/section/SECTION')
          .send({id: '', block: 1})
          .expect(400);
      });

      test('Should update sort', async () => {
        const block = await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();

        const inst = await request(app.getHttpServer())
          .put('/section/SECTION')
          .send({id: 'SECTION', sort: 777, block: 1})
          .expect(200);

        expect(inst.body.sort).toBe(777);
      });
    });

    describe('Content section update with block', () => {
      test('Should update item', async () => {
        const block = await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();

        const inst = await request(app.getHttpServer())
          .put('/section/SECTION')
          .send({id: 'SECTION', block: 1})
          .expect(200);

        expect(inst.body.id).toEqual('SECTION');
      });

      test('Shouldn`t update without block', async () => {
        const block = await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();

        await request(app.getHttpServer())
          .put('/section/SECTION')
          .send({})
          .expect(400);
      });

      test('Shouldn`t update with wrong block', async () => {
        const block = await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();

        await request(app.getHttpServer())
          .put('/section/SECTION')
          .send({block: 999})
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
        const block = await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();

        const inst = await request(app.getHttpServer())
          .put('/section/SECTION')
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
        const block = await new BlockEntity().save();
        const parent = await Object.assign(
          new SectionEntity(),
          {id: 'SECTION', block},
        ).save();
        await Object.assign(new Section2imageEntity(), {parent, image}).save();

        const inst = await request(app.getHttpServer())
          .put('/section/SECTION')
          .send({id: 'SECTION', block: 1, image: []})
          .expect(200);

        expect(inst.body.image).toHaveLength(0);
      });
    });

    describe('Content section update with parent', () => {
      test('Should update parent', async () => {
        const block = await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'PARENT', block}).save();
        await Object.assign(new SectionEntity(), {id: 'CHILD', block}).save();

        const inst = await request(app.getHttpServer())
          .put('/section/CHILD')
          .send({id: 'CHILD', block: 1, parent: 'PARENT'})
          .expect(200);

        expect(inst.body.id).toBe('CHILD');
        expect(inst.body.parent).toBe('PARENT');
      });

      test('Shouldn`t update with wrong parent', async () => {
        const block = await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();

        await request(app.getHttpServer())
          .put('/section/SECTION')
          .send({id: 'SECTION', block: 1, parent: 'WRONG'})
          .expect(400);
      });
    });

    describe('Content section with strings', () => {
      test('Should add strings', async () => {
        const block = await new BlockEntity().save();
        await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();
        await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

        const inst = await request(app.getHttpServer())
          .put('/section/SECTION')
          .send({
            id: 'SECTION',
            block: 1,
            property: [
              {property: 'NAME', string: 'VALUE'},
            ],
          })
          .expect(200);

        expect(inst.body.property).toHaveLength(1);
        expect(inst.body.property[0].property).toBe('NAME');
        expect(inst.body.property[0].string).toBe('VALUE');
      });

      test('Should remove strings', async () => {
        const block = await new BlockEntity().save();
        const parent = await Object.assign(
          new SectionEntity(),
          {id: 'SECTION', block},
        ).save();
        const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
        await Object.assign(new Section4stringEntity(), {parent, property, string: 'VALUE'}).save();

        const inst = await request(app.getHttpServer())
          .put('/section/SECTION')
          .send({
            id: 'SECTION',
            block: 1,
            property: [],
          })
          .expect(200);

        expect(inst.body.property).toHaveLength(0);
      });
    });

    test('Should add flag', async () => {
      const block = await new BlockEntity().save();
      await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const inst = await request(app.getHttpServer())
        .put('/section/SECTION')
        .send({
          id: 'SECTION',
          block: 1,
          flag: ['NEW'],
        })
        .expect(200);

      expect(inst.body.flag).toEqual(['NEW']);
    });
  });
});
