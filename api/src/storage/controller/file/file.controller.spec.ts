import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FileEntity } from '../../model/file/file.entity';
import { CollectionEntity } from '../../model/collection/collection.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { File4stringEntity } from '../../model/file/file4string.entity';
import { File2flagEntity } from '../../model/file/file2flag.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('File Controller', () => {
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

  describe('File list', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/file')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get file with limit', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FileEntity(), {
          collection,
          original: 'short.txt',
          mimetype: 'text',
          path: `txt/txt_${i}.txt`,
        }).save();
      }

      const res = await request(app.getHttpServer())
        .get('/file?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe(10);
      expect(res.body[1].id).toBe(9);
      expect(res.body[2].id).toBe(8);
    });

    test('Should get file with offset', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FileEntity(), {
          collection,
          original: 'short.txt',
          mimetype: 'text',
          path: `txt/txt_${i}.txt`,
        }).save();
      }

      const res = await request(app.getHttpServer())
        .get('/file?offset=8')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(2);
      expect(res.body[1].id).toBe(1);
    });
  });

  describe('File list filter', () => {
    test('Should get list with collection filter', async () => {
      const collection1 = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const collection2 = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new FileEntity(), {
          collection: i % 2 === 0 ? collection1 : collection2,
          original: 'short.txt',
          mimetype: 'text',
          path: `txt/txt_${i}.txt`,
        }).save();
      }

      const res = await request(app.getHttpServer())
        .get('/file?filter[collection]=DETAIL')
        .expect(200);

      expect(res.body).toHaveLength(5);
    });
  });

  describe('File item', () => {
    test('Should get file instance', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(new FileEntity(), {
        collection,
        original: 'short.txt',
        mimetype: 'text',
        path: 'txt/txt.txt',
      }).save();

      const res = await request(app.getHttpServer())
        .get('/file/1')
        .expect(200);

      expect(res.body.id).toBe(1);
    });

    test('Shouldn`t get with wrong id', async () => {
      await request(app.getHttpServer())
        .get('/file/888')
        .expect(404);
    });
  });

  describe('File count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/file/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get file count', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FileEntity(), {
          collection,
          original: 'short.txt',
          mimetype: 'text',
          path: `txt/txt_${i}.txt`,
        }).save();
      }

      const res = await request(app.getHttpServer())
        .get('/file/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });

    test('Should get count with collection filter', async () => {
      const short = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const detail = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new FileEntity(), {
          collection: i % 2 ? detail : short,
          original: 'short.txt',
          mimetype: 'text',
          path: `txt/txt_${i}.txt`,
        }).save();
      }

      const res = await request(app.getHttpServer())
        .get('/file/count?filter[collection]=DETAIL')
        .expect(200);

      expect(res.body).toEqual({count: 5});
    });
  });

  describe('File with strings', () => {
    test('Should get file with strings', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(new FileEntity(), {
        collection,
        original: 'short.txt',
        mimetype: 'text',
        path: 'txt/txt.txt',
      }).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new File4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/file')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });

    test('Should get file with lang strings', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(new FileEntity(), {
        collection,
        original: 'short.txt',
        mimetype: 'text',
        path: 'txt/txt.txt',
      }).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new File4stringEntity(), {parent, attribute, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/file')
        .expect(200);

      expect(res.body[0].attribute[0].lang).toBe('EN');
      expect(res.body[0].attribute[0].string).toBe('VALUE');
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
    });
  });

  describe('File with flags', () => {
    test('Should get file with flag', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(new FileEntity(), {
        collection,
        original: 'short.txt',
        mimetype: 'text',
        path: 'txt/txt.txt',
      }).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new File2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/file')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });

    test('Should get flag with multi flags', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(new FileEntity(), {
        collection,
        original: 'short.txt',
        mimetype: 'text',
        path: 'txt/txt.txt',
      }).save();

      for (let i = 1; i < 4; i++) {
        const flag = await Object.assign(new FlagEntity(), {id: `FLAG_${i}`}).save();
        await Object.assign(new File2flagEntity(), {parent, flag}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/file')
        .expect(200);

      expect(list.body[0].flag).toEqual(['FLAG_1', 'FLAG_2', 'FLAG_3']);
    });
  });
});
