import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DirectoryEntity } from '../../model/directory.entity';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { PointEntity } from '../../model/point.entity';
import { Point2stringEntity } from '../../model/point2string.entity';
import { Point2flagEntity } from '../../model/point2flag.entity';
import { Point2pointEntity } from '../../model/point2point.entity';
import { PropertyEntity } from '../../../settings/model/property.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';

describe('PointController', () => {
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

  describe('Point fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/point')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get point instance', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'NAME'}).save();
      await Object.assign(new PointEntity(), {id: 'NAME', directory}).save();

      const res = await request(app.getHttpServer())
        .get('/point')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('NAME');
    });

    test('Should get point with limit', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'NAME'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new PointEntity(), {id: `NAME_${i}`, directory}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/point?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('NAME_0');
      expect(res.body[1].id).toBe('NAME_1');
      expect(res.body[2].id).toBe('NAME_2');
    });

    test('Should get point with offset', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'NAME'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new PointEntity(), {id: `NAME_${i}`, directory}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/point?offset=3')
        .expect(200);

      expect(res.body).toHaveLength(7);
      expect(res.body[0].id).toBe('NAME_3');
      expect(res.body[6].id).toBe('NAME_9');
    });
  });

  describe('Point count', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/point/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get empty list', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'NAME'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new PointEntity(), {id: `NAME_${i}`, directory}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/point/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Point with strings', () => {
    test('Should get with strings', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Point2stringEntity(), {parent, property, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/point')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('LONDON');
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
    });

    test('Should get point with lang strings', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Point2stringEntity(), {parent, property, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/point')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].property[0].lang).toBe('EN');
      expect(res.body[0].property[0].string).toBe('VALUE');
    });
  });

  describe('Point with flags', () => {
    test('Should get point with flag', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Point2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/point')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });
  });

  describe('Point with point', () => {
    test('Should get point with point', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'RULES'}).save();

      await Object.assign(new Point2pointEntity(), {parent, property, point}).save();

      const list = await request(app.getHttpServer())
        .get('/point')
        .expect(200);

      expect(list.body).toHaveLength(2);
      expect(list.body[0].id).toBe('LONDON');
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].point).toBe('PARIS');
      expect(list.body[0].property[0].directory).toBe('CITY');
    });
  });

  describe('Point addition', () => {
    test('Should add point', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      const res = await request(app.getHttpServer())
        .post('/point')
        .send({
          id: 'London',
          directory: 'CITY',
        })
        .expect(201);

      expect(res.body.id).toBe('London')
      expect(res.body.directory).toBe('CITY')
    });

    test('Shouldn`t add without directory', async () => {
      await request(app.getHttpServer())
        .post('/point')
        .send({
          id: 'London',
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong directory', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      await request(app.getHttpServer())
        .post('/point')
        .send({
          id: 'London',
          directory: 'WRONG',
        })
        .expect(400);
    });
  });
});
