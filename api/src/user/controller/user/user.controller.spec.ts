import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { UserEntity } from '../../model/user.entity';
import * as request from 'supertest';
import { User2stringEntity } from '../../model/user2string.entity';
import { User2flagEntity } from '../../model/user2flag.entity';
import { DirectoryEntity } from '../../../directory/model/directory.entity';
import { PointEntity } from '../../../directory/model/point.entity';
import { User2pointEntity } from '../../model/user2point.entity';
import { PropertyEntity } from '../../../settings/model/property.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';

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

    test('Should get user with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new UserEntity(), {login: `USER_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get(`/user?limit=3`)
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].login).toBe('USER_0');
      expect(res.body[1].login).toBe('USER_1');
      expect(res.body[2].login).toBe('USER_2');
    });

    test('Should get user with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new UserEntity(), {login: `USER_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get(`/user?offset=7`)
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].login).toBe('USER_7');
      expect(res.body[1].login).toBe('USER_8');
      expect(res.body[2].login).toBe('USER_9');
    });
  });

  describe('User count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get user count', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new UserEntity(), {login: `USER_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/user/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
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

  describe('User addition', () => {
    test('Should add user', async () => {
      const inst = await request(app.getHttpServer())
        .post('/user')
        .send({login: 'user'})
        .expect(201);

      expect(inst.body.id).toBe(1);
      expect(inst.body.login).toBe('user');
    });

    test('Shouldn`t add without login', async () => {
      const inst = await request(app.getHttpServer())
        .post('/user')
        .send({})
        .expect(400);
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