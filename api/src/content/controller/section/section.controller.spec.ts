import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { BlockEntity } from '../../model/block/block.entity';
import { SectionEntity } from '../../model/section/section.entity';
import { Section4stringEntity } from '../../model/section/section4string.entity';
import { Section2flagEntity } from '../../model/section/section2flag.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { Section4pointEntity } from '../../model/section/section4point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { FileEntity } from '../../../storage/model/file/file.entity';
import { Section2imageEntity } from '../../model/section/section2image.entity';
import { Section2permissionEntity } from '../../model/section/section2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('Section controller', () => {
  let source: DataSource;
  let app: INestApplication;

  async function createSection(id = 'SECTION'): Promise<SectionEntity> {
    await new BlockEntity('BLOCK').save();
    const parent = await Object.assign(new SectionEntity(), {id, block: 'BLOCK'}).save();
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

  describe('Content section list', () => {
    test('Should get empty section list', async () => {
      const list = await request(app.getHttpServer())
        .get('/content/section')
        .expect(200);

      expect(list.body).toEqual([]);
    });

    test('Should get section list', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new SectionEntity(), {id: 'SECTION', block: 'BLOCK'}).save();

      const list = await request(app.getHttpServer())
        .get('/content/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe('SECTION');
      expect(list.body[0].block).toBe('BLOCK');
      expect(list.body[0].sort).toBe(100);
    });

    test('Should get list with block filter', async () => {
      await new BlockEntity('BLOCK_1').save();
      await new BlockEntity('BLOCK_2').save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new SectionEntity(), {block: i % 2 ? 'BLOCK_2' : 'BLOCK_1'}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section?filter[block]=BLOCK_2')
        .expect(200);

      expect(list.body).toHaveLength(5);
    });

    test('Should get section item', async () => {
      await createSection();

      const item = await request(app.getHttpServer())
        .get('/content/section/SECTION')
        .expect(200);

      expect(item.body.id).toBe('SECTION');
      expect(item.body.block).toBe('BLOCK');
    });

    test('Should get section with parent', async () => {
      await new BlockEntity('BLOCK').save();
      const parent = await Object.assign(
        new SectionEntity(),
        {id: 'PARENT', block: 'BLOCK'},
      ).save();
      await Object.assign(new Section2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();

      const child = await Object.assign(
        new SectionEntity(),
        {id: 'CHILD', block: 'BLOCK', parent},
      ).save();
      await Object.assign(new Section2permissionEntity(), {parent: child, method: PermissionMethod.ALL}).save();

      const item = await request(app.getHttpServer())
        .get('/content/section/CHILD')
        .expect(200);

      expect(item.body.id).toBe('CHILD');
      expect(item.body.parent).toBe('PARENT');
    });

    test('Should get with limit', async () => {
      await new BlockEntity('BLOCK').save();
      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new SectionEntity(),
          {id: `SECTION_${i.toString().padStart(2, '0')}`, block: 'BLOCK'},
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section?limit=3')
        .expect(200);

      expect(list.body).toHaveLength(3);
      expect(list.body[0].id).toBe('SECTION_09');
      expect(list.body[1].id).toBe('SECTION_08');
      expect(list.body[2].id).toBe('SECTION_07');
    });

    test('Should get with offset', async () => {
      await new BlockEntity('BLOCK').save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new SectionEntity(),
          {id: `SECTION_${i.toString().padStart(2, '0')}`, block: 'BLOCK'},
        ).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section?offset=6')
        .expect(200);

      expect(list.body).toHaveLength(4);
      expect(list.body[0].id).toBe('SECTION_03');
      expect(list.body[1].id).toBe('SECTION_02');
      expect(list.body[2].id).toBe('SECTION_01');
      expect(list.body[3].id).toBe('SECTION_00');
    });
  });

  describe('Content section sorting', () => {
    test('Should get with offset', async () => {
      await new BlockEntity('BLOCK').save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new SectionEntity(),
          {
            id: `SECTION_${i.toString().padStart(2, '0')}`,
            sort: 1000 - i * 100,
            block: 'BLOCK',
          }
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
      await new BlockEntity('BLOCK').save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new SectionEntity(), {block: 'BLOCK'}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section/count')
        .expect(200);

      expect(list.body).toEqual({count: 10});
    });

    test('Should get count with filter', async () => {
      await new BlockEntity('BLOCK_1').save();
      await new BlockEntity('BLOCK_2').save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new SectionEntity(), {block: i % 2 ? 'BLOCK_1' : 'BLOCK_2'}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/content/section/count?filter[block]=BLOCK_1')
        .expect(200);

      expect(list.body).toEqual({count: 5});
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
      const block = await new BlockEntity('BLOCK').save();
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
      const block = await new BlockEntity('BLOCK').save();
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

  describe('Content section with attributes', () => {
    describe('Content section with strings', () => {
      test('Should get section with strings', async () => {
        const block = await new BlockEntity('BLOCK').save();
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
        const block = await new BlockEntity('BLOCK').save();
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

    describe('Content section with points', () => {
      test('Should get section with point', async () => {
        const block = await new BlockEntity('BLOCK').save();
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
  });

  describe('Content section flag filter', () => {
    test('Should get section with flag filter', async () => {
      const block = await new BlockEntity('BLOCK').save();
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
      const block = await new BlockEntity('BLOCK').save();
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
});
