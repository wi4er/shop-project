import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';

describe('Contact addition', () => {
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

  describe('Contact addition with fields', () => {
    test('Should add contact', async () => {
      const inst = await request(app.getHttpServer())
        .post('/personal/contact')
        .send({
          id: 'mail',
          type: 'EMAIL',
        })
        .expect(201);

      expect(inst.body.id).toBe('mail');
      expect(inst.body.type).toBe('EMAIL');
    });

    test('Shouldn`t add without type', async () => {
      await request(app.getHttpServer())
        .post('/personal/contact')
        .send({id: 'mail'})
        .expect(400);
    });

    test('Shouldn`t add with wrong type', async () => {
      await request(app.getHttpServer())
        .post('/personal/contact')
        .send({id: 'mail', type: 'WRONG'})
        .expect(400);
    });

    test('Shouldn`t add without id', async () => {
      await request(app.getHttpServer())
        .post('/personal/contact')
        .send({type: 'EMAIL'})
        .expect(400);
    });

    test('Shouldn`t add with blank id', async () => {
      await request(app.getHttpServer())
        .post('/personal/contact')
        .send({id: '', type: 'EMAIL'})
        .expect(400);
    });
  });
});