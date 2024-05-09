import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { ConfigurationEntity } from '../../model/configuration.entity';

describe('ConfigurationController', () => {
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

  describe('Configuration fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/config')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });
  });

  describe('Configuration addition', () => {
    test('Should add item', async () => {
      const res = await request(app.getHttpServer())
        .post('/config')
        .send({
          id: 'DEFAULT',
          value: 'NAME',
        })
        .expect(201);

      expect(res.body.id).toBe('DEFAULT');
      expect(res.body.value).toBe('NAME');
      expect(res.body.created_at).toBeDefined();
      expect(res.body.updated_at).toBeDefined();
      expect(res.body.version).toBe(1);
    });

    test('Shouldn`t add with same id', async () => {
      await request(app.getHttpServer())
        .post('/config')
        .send({
          id: 'DEFAULT',
          value: 'NAME',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/config')
        .send({
          id: 'DEFAULT',
          value: 'NAME',
        })
        .expect(400);
    });
  });

  describe('Configuration updating', () => {
    test('Should update item', async () => {
      await Object.assign(
        new ConfigurationEntity(),
        {id: 'NAME', value: 'NAME'},
      ).save();

      const res = await request(app.getHttpServer())
        .put('/config/NAME')
        .send({
          id: 'NAME',
          value: 'UPDATED',
        })
        .expect(200);

      expect(res.body.id).toBe('NAME');
      expect(res.body.value).toBe('UPDATED');
    });

    test('Should update id', async () => {
      await Object.assign(
        new ConfigurationEntity(),
        {id: 'NAME', value: 'NAME'},
      ).save();

      const res = await request(app.getHttpServer())
        .put('/config/NAME')
        .send({
          id: 'UPDATED',
          value: 'UPDATED',
        })
        .expect(200);

      expect(res.body.id).toBe('UPDATED');
      expect(res.body.value).toBe('UPDATED');
    });
  });
});
