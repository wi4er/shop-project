import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FormEntity } from '../../model/form/form.entity';
import { ResultEntity } from '../../model/result/result.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('Result Controller', () => {
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

  describe('Result fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/feedback/result')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get feedback instance', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      await Object.assign(new ResultEntity(), {form}).save();

      const res = await request(app.getHttpServer())
        .get('/feedback/result/1')
        .expect(200);

      expect(res.body.id).toBe(1);
    });

    test('Should get feedback with limit', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new ResultEntity(), {form}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/feedback/result?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe(1);
      expect(res.body[1].id).toBe(2);
      expect(res.body[2].id).toBe(3);
    });

    test('Should get feedback with offset', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new ResultEntity(), {form}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/feedback/result?offset=9')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(10);
    });
  });

  describe('Result count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/feedback/result/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get feedback count', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new ResultEntity(), {form}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/feedback/result/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Result with form filter', () => {
    // test('Should filter list', async () => {
    //   const form = await Object.assign(new FormEntity(), {id: 'FORM_1'}).save();
    //   for (let i = 0; i < 10; i++) {
    //     await Object.assign(new ResultEntity(), {form}).save();
    //   }
    //
    //   const form2 = await Object.assign(new FormEntity(), {id: 'FORM_2'}).save();
    //   for (let i = 0; i < 8; i++) {
    //     await Object.assign(new ResultEntity(), {form: form2}).save();
    //   }
    //
    //   const res = await request(app.getHttpServer())
    //     .get('/feedback/result?filter[form]=FORM_2')
    //     .expect(200);
    //
    //   expect(res.body).toHaveLength(8)
    // });
  });
});
