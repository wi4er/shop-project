import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FormEntity } from '../../model/form/form.entity';
import { Form2logEntity } from '../../model/form/form2log.entity';

describe('Form Log Controller', () => {
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

  describe('Form log list', () => {
    test('Should get empty list', async () => {
      await Object.assign(new FormEntity(), {id: 'FORM'}).save();

      const res = await request(app.getHttpServer())
        .get('/feedback/form-log/FORM')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get list', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new Form2logEntity(),
          {parent, version: i % 5 + 1, value: 'property.id', from: '1', to: '2'} as Form2logEntity,
        ).save();
      }

      const res = await request(app.getHttpServer())
        .get('/feedback/form-log/FORM')
        .expect(200);

      expect(res.body).toHaveLength(5);
    });

    test('Should get list with limit', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new Form2logEntity(),
          {parent, version: i % 5 + 1, value: 'property.id', from: '1', to: '2'} as Form2logEntity,
        ).save();
      }

      const res = await request(app.getHttpServer())
        .get('/feedback/form-log/FORM?limit=3')
        .expect(200);

      console.log(res.body);

      expect(res.body.map(it => it.version)).toEqual([1, 2, 3]);
    });

    test('Should get list with offset', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new Form2logEntity(),
          {parent, version: i % 5 + 1, value: 'property.id', from: '1', to: '2'} as Form2logEntity,
        ).save();
      }

      const res = await request(app.getHttpServer())
        .get('/feedback/form-log/FORM?offset=3')
        .expect(200);

      expect(res.body.map(it => it.version)).toEqual([4, 5]);
    });

    test('Should get list with version sort', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new Form2logEntity(),
          {parent, version: i % 5 + 1, value: 'property.id', from: '1', to: '2'} as Form2logEntity,
        ).save();
      }

      const res1 = await request(app.getHttpServer())
        .get('/feedback/form-log/FORM?sort[version]=ASC')
        .expect(200);
      expect(res1.body.map(it => it.version)).toEqual([1, 2, 3, 4, 5]);

      const res2 = await request(app.getHttpServer())
        .get('/feedback/form-log/FORM?sort[version]=DESC')
        .expect(200);

      expect(res2.body.map(it => it.version)).toEqual([5, 4, 3, 2, 1]);
    });
  });

  describe('Form log count', () => {
    test('Should get log count', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(
          new Form2logEntity(),
          {parent, version: i % 5 + 1, value: 'property.id', from: '1', to: '2'} as Form2logEntity,
        ).save();
      }

      const res = await request(app.getHttpServer())
        .get('/feedback/form-log/FORM/count')
        .expect(200);

      expect(res.body).toEqual({count: 5});
    })
  });
});
