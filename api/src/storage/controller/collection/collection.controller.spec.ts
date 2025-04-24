import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { CollectionEntity } from '../../model/collection.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { Collection4stringEntity } from '../../model/collection4string.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { Collection2flagEntity } from '../../model/collection2flag.entity';

describe('CollectionController', () => {
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

  describe('Collection fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/collection')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get file with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new CollectionEntity(), {id: `COL_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/collection?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('COL_0');
      expect(res.body[1].id).toBe('COL_1');
      expect(res.body[2].id).toBe('COL_2');
    });

    test('Should get file with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new CollectionEntity(), {id: `COL_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/collection?offset=8')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe('COL_8');
      expect(res.body[1].id).toBe('COL_9');
    });
  });

  describe('Collection item', () => {
    test('Should get collection instance', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();

      const res = await request(app.getHttpServer())
        .get('/collection/SHORT')
        .expect(200);

      expect(res.body.id).toBe('SHORT');
    });

    test('Shouldn`t get with wrong id', async () => {
      const res = await request(app.getHttpServer())
        .get('/collection/WRONG')
        .expect(404);
    });
  });

  describe('Collection count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/collection/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get file count', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new CollectionEntity(), {id: `COL_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/collection/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Collection with strings', () => {
    test('Should get flag with strings', async () => {
      const parent = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Collection4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/collection')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });

    test('Should get collection with lang strings', async () => {
      const parent = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Collection4stringEntity(), {parent, attribute, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/collection')
        .expect(200);

      expect(res.body[0].attribute[0].string).toBe('VALUE');
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBe('EN');
    });
  });

  describe('Collection with flags', () => {
    test('Should get collection with flag', async () => {
      const parent = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Collection2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/collection')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });

    test('Should get collection with multi flags', async () => {
      const parent = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();

      for (let i = 1; i < 4; i++) {
        const flag = await Object.assign(new FlagEntity(), {id: `FLAG_${i}`}).save();
        await Object.assign(new Collection2flagEntity(), {parent, flag}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/collection')
        .expect(200);

      expect(list.body[0].flag).toEqual(['FLAG_1', 'FLAG_2', 'FLAG_3']);
    });
  });

  describe('Collection addition', () => {
    test('Should add item', async () => {
      const inst = await request(app.getHttpServer())
        .post('/collection')
        .send({id: 'SHORT'})
        .expect(201);

      expect(inst.body.id).toBe('SHORT');
      expect(inst.body.created_at).toBeDefined();
      expect(inst.body.updated_at).toBeDefined();
      expect(inst.body.version).toBe(1);
    });

    test('Shouldn`t add with blank id', async () => {
      const inst = await request(app.getHttpServer())
        .post('/collection')
        .send({id: ''})
        .expect(400);
    });

    test('Shouldn`t add duplicate', async () => {
      await request(app.getHttpServer())
        .post('/collection')
        .send({id: 'SHORT'})
        .expect(201);

      await request(app.getHttpServer())
        .post('/collection')
        .send({id: 'SHORT'})
        .expect(400);
    });

    test('Should add with string', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/collection')
        .send({
          id: 'DETAIL',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .post('/collection')
        .send({
          id: 'DETAIL',
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('Collection updating', () => {
    test('Should update collection', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const res = await request(app.getHttpServer())
        .put('/collection/SHORT')
        .send({id: 'SHORT'})
        .expect(200);

      expect(res.body.id).toBe('SHORT');
    });

    test('Should update id', async () => {
      await Object.assign(new CollectionEntity(), {id: 'OLD'}).save();
      const res = await request(app.getHttpServer())
        .put('/collection/OLD')
        .send({id: 'NEW'})
        .expect(200);

      expect(res.body.id).toBe('NEW');
    });

    test('Shouldn`t update with wrong id', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const res = await request(app.getHttpServer())
        .put('/collection/WRONG')
        .send({id: 'SHORT'})
        .expect(404);
    });

    test('Should add string', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .put('/collection/SHORT')
        .send({
          id: 'SHORT',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(200);

      expect(res.body.attribute).toHaveLength(1);
      expect(res.body.attribute[0].attribute).toBe('NAME');
      expect(res.body.attribute[0].string).toBe('VALUE');
    });

    test('Should add flag', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const res = await request(app.getHttpServer())
        .put('/collection/SHORT')
        .send({
          id: 'SHORT',
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(res.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('Collection deletion', () => {
    test('Should delete', async () => {
      await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();

      const inst = await request(app.getHttpServer())
        .delete('/collection/SHORT')
        .expect(200);

      expect(inst.body).toEqual(['SHORT']);
    });
  });
});
