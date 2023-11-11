import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DirectoryEntity } from '../../model/directory.entity';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { PointEntity } from '../../model/point.entity';
import { PropertyEntity } from '../../../property/model/property.entity';
import { LangEntity } from '../../../lang/model/lang.entity';
import { Point2stringEntity } from '../../model/point2string.entity';
import { FlagEntity } from '../../../flag/model/flag.entity';
import { Point2flagEntity } from '../../model/point2flag.entity';
import { Point2pointEntity } from '../../model/point2point.entity';

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
});
