import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FileEntity } from '../../model/file.entity';
import { CollectionEntity } from '../../model/collection.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { PropertyEntity } from '../../../settings/model/property.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { File4stringEntity } from '../../model/file4string.entity';
import { File2flagEntity } from '../../model/file2flag.entity';

describe('FileController', () => {
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

  describe('File fields', () => {
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
      expect(res.body[0].id).toBe(1);
      expect(res.body[1].id).toBe(2);
      expect(res.body[2].id).toBe(3);
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
      expect(res.body[0].id).toBe(9);
      expect(res.body[1].id).toBe(10);
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
          collection: i % 2 ? detail : short ,
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
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new File4stringEntity(), {parent, property, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/file')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
    });

    test('Should get file with lang strings', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(new FileEntity(), {
        collection,
        original: 'short.txt',
        mimetype: 'text',
        path: 'txt/txt.txt',
      }).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new File4stringEntity(), {parent, property, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/file')
        .expect(200);

      expect(res.body[0].property[0].lang).toBe('EN');
      expect(res.body[0].property[0].string).toBe('VALUE');
      expect(res.body[0].property[0].property).toBe('NAME');
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

  describe('File addition', () => {
    test('Should add item', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const inst = await request(app.getHttpServer())
        .post('/file')
        .send({
          collection: 'SHORT',
          original: 'short.txt',
          mimetype: 'text',
          path: 'txt/txt.txt',
        })
        .expect(201);

      expect(inst.body.id).toBe(1);
      expect(inst.body.original).toBe('short.txt');
      expect(inst.body.mimetype).toBe('text');
      expect(inst.body.collection).toBe('SHORT');
      expect(inst.body.created_at).toBeDefined();
      expect(inst.body.updated_at).toBeDefined();
      expect(inst.body.version).toBe(1);
    });

    test('Shouldn`t add without original', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await request(app.getHttpServer())
        .post('/file')
        .send({
          collection: 'SHORT',
          mimetype: 'text',
          path: 'txt/txt.txt',
        })
        .expect(400);
    });

    test('Shouldn`t add without mimetype', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await request(app.getHttpServer())
        .post('/file')
        .send({
          collection: 'SHORT',
          original: 'short.txt',
          path: 'txt/txt.txt',
        })
        .expect(400);
    });

    test('Shouldn`t add without collection', async () => {
      await request(app.getHttpServer())
        .post('/file')
        .send({
          original: 'short.txt',
          mimetype: 'text',
          path: 'txt/txt.txt',
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong collection', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await request(app.getHttpServer())
        .post('/file')
        .send({
          collection: 'WRONG',
          original: 'short.txt',
          mimetype: 'text',
          path: 'txt/txt.txt',
        })
        .expect(400);
    });

    test('Should add with string', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/file')
        .send({
          collection: 'SHORT',
          original: 'short.txt',
          mimetype: 'text',
          path: 'txt/txt.txt',
          property: [
            {property: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(201);

      expect(inst.body.property).toHaveLength(1);
      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].string).toBe('VALUE');
    });

    test('Should add with flag', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .post('/file')
        .send({
          collection: 'SHORT',
          original: 'short.txt',
          mimetype: 'text',
          path: 'txt/txt.txt',
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('File updating', () => {
    test('Should update file', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(new FileEntity(), {
        collection: 'SHORT',
        original: 'short.txt',
        mimetype: 'text',
        path: 'txt/txt.txt',
      }).save();
      const res = await request(app.getHttpServer())
        .put('/file/1')
        .send({collection: 'SHORT'})
        .expect(200);

      expect(res.body.id).toBe(1);
      expect(res.body.collection).toBe('SHORT');
    });

    test('Should add string', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(new FileEntity(), {
        collection,
        original: 'short.txt',
        mimetype: 'text',
        path: 'txt/txt.txt',
      }).save();
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .put('/file/1')
        .send({
          id: 'NEW',
          collection: 'SHORT',
          original: 'short.txt',
          mimetype: 'text',
          path: 'txt/txt.txt',
          property: [
            {property: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(200);

      expect(res.body.property).toHaveLength(1);
      expect(res.body.property[0].property).toBe('NAME');
      expect(res.body.property[0].string).toBe('VALUE');
    });

    test('Should add flag', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(new FileEntity(), {
        collection,
        original: 'short.txt',
        mimetype: 'text',
        path: 'txt/txt.txt',
      }).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const res = await request(app.getHttpServer())
        .put('/file/1')
        .send({
          collection: 'SHORT',
          original: 'short.txt',
          mimetype: 'text',
          path: 'txt/txt.txt',
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(res.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('File deletion', () => {
    test('Should delete', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(new FileEntity(), {
        collection,
        original: 'short.txt',
        mimetype: 'text',
        path: 'txt/txt.txt',
      }).save();

      const inst = await request(app.getHttpServer())
        .delete('/file/1')
        .expect(200);

      expect(inst.body).toEqual([1]);
    });
  });
});
