import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { UserEntity } from '../../model/user.entity';
import * as request from 'supertest';
import { DataSource } from 'typeorm/data-source/DataSource';
import { GroupEntity } from '../../model/group.entity';
import { User2groupEntity } from '../../model/user2group.entity';

describe('AuthController', () => {
  let source: DataSource;
  let app;

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule({ imports: [ AppModule ] }).compile();
    app = moduleBuilder.createNestApplication();
    app.init();

    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('User auth', () => {
    test('Should auth', async () => {
      await Object.assign(new UserEntity(), {
        login: 'USER',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();

      const res = await request(app.getHttpServer())
        .post('/auth')
        .send({
          login: 'USER',
          password: 'qwerty',
        })
        .expect(201);

      expect(res.body.id).toBe(1);
      expect(res.body.login).toBe('USER');
      expect(res.body.group).toEqual([]);
    });

    test('Should auth with group', async () => {
      const parent = await Object.assign(new UserEntity(), {
        login: 'USER',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();
      const group = await Object.assign(new GroupEntity(), {}).save();
      await Object.assign(new User2groupEntity(), {group, parent}).save();

      const res = await request(app.getHttpServer())
        .post('/auth')
        .send({
          login: 'USER',
          password: 'qwerty',
        })
        .expect(201);

      expect(res.body.id).toBe(1);
      expect(res.body.login).toBe('USER');
      expect(res.body.group).toEqual([1]);
    });

    test('Should auth with multi users', async () => {
      const group = await Object.assign(new GroupEntity(), {}).save();
      const parent1 = await Object.assign(new UserEntity(), {
        login: 'USER_1',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();
      await Object.assign(new User2groupEntity(), {group, parent: parent1}).save();
      const parent2 = await Object.assign(new UserEntity(), {
        login: 'USER_2',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();
      await Object.assign(new User2groupEntity(), {group, parent: parent2}).save();

      const res = await request(app.getHttpServer())
        .post('/auth')
        .send({
          login: 'USER_2',
          password: 'qwerty',
        })
        .expect(201);

      expect(res.body.id).toBe(2);
      expect(res.body.login).toBe('USER_2');
      expect(res.body.group).toEqual([1]);
    });

    test('Shouldn`t auth with wrong password', async () => {
      await Object.assign(new UserEntity(), {
        login: 'USER',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();

      const res = await request(app.getHttpServer())
        .post('/auth')
        .send({
          login: 'USER',
          password: 'wrong',
        })
        .expect(403);
    });

    test('Shouldn`t auth without password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth')
        .send({
          login: 'USER',
          password: 'qwerty',
        })
        .expect(403);
    });
  });

  describe('Session closing', () => {
    test('Should close session', async () => {
      await Object.assign(new UserEntity(), {
        login: 'USER',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();

      const user = await request(app.getHttpServer())
        .post('/auth')
        .send({
          login: 'USER',
          password: 'qwerty'
        })
        .expect(201);

      const cookie = user.headers['set-cookie'];

      const res = await request(app.getHttpServer())
        .delete('/auth')
        .set('cookie', cookie);

      expect(res.body).toBe(true);
      expect(res.status).toBe(200);
    });

    test('Shouldn`t close without session', async () => {
      const res = await request(app.getHttpServer())
        .delete('/auth');

      expect(res.body).toBe(false);
      expect(res.status).toBe(400);
    });
  });
});
