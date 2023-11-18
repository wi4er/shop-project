import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { DirectoryEntity } from '../../model/directory.entity';
import { PropertyEntity } from '../../../property/model/property.entity';
import { Directory2stringEntity } from '../../model/directory2string.entity';
import { LangEntity } from '../../../lang/model/lang.entity';
import { FlagEntity } from '../../../flag/model/flag.entity';
import { Directory2flagEntity } from '../../model/directory2flag.entity';
import { PointEntity } from '../../model/point.entity';
import { Directory2pointEntity } from '../../model/directory2point.entity';

describe('DirectoryController', () => {
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

  describe('Directory fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get directory instance', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('NAME');
    });

    test('Should get directory with limit', async () => {
      for (let i = 0; i <= 9; i++) {
        await Object.assign(new DirectoryEntity(), {id: `NAME_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/directory?limit=2')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe('NAME_0');
      expect(res.body[1].id).toBe('NAME_1');
    });

    test('Should get directory with offset', async () => {
      for (let i = 0; i <= 9; i++) {
        await Object.assign(new DirectoryEntity(), {id: `NAME_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/directory?offset=8')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe('NAME_8');
      expect(res.body[1].id).toBe('NAME_9');
    });
  });

  describe('Directory count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/directory/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get directory count', async () => {
      for (let i = 0; i <= 9; i++) {
        await Object.assign(new DirectoryEntity(), {id: `NAME_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/directory/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Directory with strings', () => {
    test('Should get with strings', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(
        new Directory2stringEntity(),
        {parent: 'CITY', property: 'NAME', string: 'VALUE'},
      ).save();

      const res = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('CITY');
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
    });

    test('Should get directory with lang strings', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(
        new Directory2stringEntity(),
        {parent: 'CITY', property: 'NAME', lang: 'EN', string: 'VALUE'},
      ).save();

      const res = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].property[0].lang).toBe('EN');
      expect(res.body[0].property[0].string).toBe('VALUE');
    });
  });

  describe('Directory with flags', () => {
    test('Should get directory with flag', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Directory2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });
  });

  describe('Directory with point', () => {
    test('Should get directory with point', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      const parent = await Object.assign(new DirectoryEntity(), {id: 'STATE'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CAPITAL'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Directory2pointEntity(), {parent, property, point}).save();

      const list = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(list.body).toHaveLength(2);
      expect(list.body[1].property).toHaveLength(1);
      expect(list.body[1].property[0].point).toBe('LONDON');
      expect(list.body[1].property[0].directory).toBe('CITY');
    });
  });

  describe('Directory post', () => {
    test('Should add item', async () => {
      const res = await request(app.getHttpServer())
        .post('/directory')
        .send({
          id: 'LIST',
        });

      expect(res.body['id']).toBe('LIST');
    });
  });

  describe('Directory put', () => {
    test('Should update item', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      const res = await request(app.getHttpServer())
        .put('/directory')
        .send({id: 'CITY'});
    });
  });
});
