import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { UserEntity } from '../../model/user.entity';
import * as request from 'supertest';
import { PropertyEntity } from '../../../property/model/property.entity';
import { User2stringEntity } from '../../model/user2string.entity';
import { FlagEntity } from '../../../flag/model/flag.entity';
import { User2flagEntity } from '../../model/user2flag.entity';
import { DirectoryEntity } from '../../../directory/model/directory.entity';
import { PointEntity } from '../../../directory/model/point.entity';
import { User2pointEntity } from '../../model/user2point.entity';

describe('UserController', () => {
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

  describe('User fields', () => {
    test('Should get user list', async () => {
      await Object.assign(new UserEntity(), {login: 'USER'}).save();

      const res = await request(app.getHttpServer())
        .get('/user')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(1);
      expect(res.body[0].login).toBe('USER');
    });

    test('Should get user item', async () => {
      await Object.assign(new UserEntity(), {login: 'USER'}).save();

      const res = await request(app.getHttpServer())
        .get(`/user/1`)
        .expect(200);

      expect(res.body.id).toBe(1);
      expect(res.body.login).toBe('USER');
    });

    test('Should get user list', async () => {
      await Object.assign(new UserEntity(), {login: 'USER'}).save();

      const res = await request(app.getHttpServer())
        .get(`/user`)
        .expect(200);

      expect(res.body[0].id).toBe(1);
      expect(res.body[0].login).toBe('USER');
    });
  });

  describe('User with strings', () => {
    test('Should get user with strings', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new UserEntity(), {login: 'USER'}).save();
      await Object.assign(new User2stringEntity(), {parent, property, string: 'John'}).save();

      const list = await request(app.getHttpServer())
        .get('/user')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].string).toBe('John');
      expect(list.body[0].property[0].property).toBe('NAME');
    });
  });

  describe('User with flags', () => {
    test('Should get user with flag', async () => {
      const parent = await Object.assign(new UserEntity(), {login: 'USER'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new User2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/user')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });
  });

  describe('User with points', () => {
    test('Should get section with point', async () => {
      const parent = await Object.assign(new UserEntity(), {login: 'USER'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'GENDER'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'SEX'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'MAIL', directory}).save();

      await Object.assign(new User2pointEntity(), {point, parent, property}).save();

      const list = await request(app.getHttpServer())
        .get('/user')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].property).toBe('SEX')
      expect(list.body[0].property[0].point).toBe('MAIL')
      expect(list.body[0].property[0].directory).toBe('GENDER')
    });
  });

  describe('User deletion', () => {
    test('Should delete', async () => {
      await Object.assign(new UserEntity(), {login: 'USER'}).save();

      const drop = await request(app.getHttpServer())
        .delete('/user/1');

      expect(drop.body).toEqual([1]);

      const rest = await request(app.getHttpServer())
        .get('/user');

      expect(rest.body).toEqual([]);
    });
  });
});