import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { CollectionEntity } from '../../model/collection/collection.entity';
import { FileEntity } from '../../model/file/file.entity';
import * as request from 'supertest';

describe('File deletion', () => {
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