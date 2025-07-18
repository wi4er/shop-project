import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { CollectionEntity } from '../../model/collection/collection.entity';
import { FileEntity } from '../../model/file/file.entity';
import * as request from 'supertest';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('File updating', () => {
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
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .put('/file/1')
        .send({
          id: 'NEW',
          collection: 'SHORT',
          original: 'short.txt',
          mimetype: 'text',
          path: 'txt/txt.txt',
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
});