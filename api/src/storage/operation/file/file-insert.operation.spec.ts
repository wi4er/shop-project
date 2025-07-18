import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { CollectionEntity } from '../../model/collection/collection.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('File addition', () => {
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
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/file')
        .send({
          collection: 'SHORT',
          original: 'short.txt',
          mimetype: 'text',
          path: 'txt/txt.txt',
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
});