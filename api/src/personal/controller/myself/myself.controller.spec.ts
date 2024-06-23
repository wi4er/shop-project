import { Test } from '@nestjs/testing';
import { UserEntity } from '../../model/user.entity';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { GroupEntity } from '../../model/group.entity';
import { User2groupEntity } from '../../model/user2group.entity';
import * as process from 'process';

describe('MyselfController', () => {
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

  describe('Getting myself', () => {
    test('Should get myself', async () => {
      await Object.assign(new UserEntity(), {
        login: 'user',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();

      const {headers} = await request(app.getHttpServer())
        .post(`/auth`)
        .send({
          login: 'user',
          password: 'qwerty',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/myself`)
        .set('cookie', headers['set-cookie']);

      expect(res.body.id).toBe(1);
      expect(res.body.login).toBe('user');
    });

    test('Should get with group', async () => {
      const group = await new GroupEntity().save();
      const parent = await Object.assign(new UserEntity(), {
        login: 'user',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();
      await Object.assign(new User2groupEntity(), {parent, group}).save();

      const {headers} = await request(app.getHttpServer())
        .post(`/auth`)
        .send({
          login: 'user',
          password: 'qwerty',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/myself`)
        .set('cookie', headers['set-cookie'])
        .expect(200);

      expect(res.body.id).toBe(1);
      expect(res.body.login).toBe('user');
      expect(res.body.group).toEqual([1]);
    });

    test('Shouldn`t get without authorization', async () => {
      const res = await request(app.getHttpServer())
        .get(`/myself`)
        .expect(403);
    });
  });

  describe('Updating myself', () => {
    test('Should update myself', async () => {
      await Object.assign(new UserEntity(), {
        login: 'user',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();

      const {headers} = await request(app.getHttpServer())
        .post(`/auth`)
        .send({
          login: 'user',
          password: 'qwerty',
        });

      const res = await request(app.getHttpServer())
        .put(`/myself`)
        .send({
          login: 'admin',
          hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
          group: [],
          contact: [],
          property: [],
        })
        .set('cookie', headers['set-cookie'])
        .expect(200);

      expect(res.body.id).toBe(1);
      expect(res.body.login).toBe('admin');
    });

    test('Shouldn`t update without authorization', async () => {
      const res = await request(app.getHttpServer())
        .put(`/myself`)
        .send({
          login: 'admin',
        })
        .expect(403);
    });
  });

  describe('User registration', () => {
    test('Should register user', async () => {
      const res = await request(app.getHttpServer())
        .post('/myself')
        .send({
          login: 'user',
          password: 'qwerty123',
        })
        .expect(201);

      expect(res.body.id).toBe(1);
      expect(res.body.login).toBe('user');
      expect(res.body.group).toEqual([]);
    });

    test('Should register with public group', async () => {
      const group = await Object.assign(new GroupEntity(), {}).save();
      process.env.PUBLIC_GROUP = String(group.id);

      const res = await request(app.getHttpServer())
        .post('/myself')
        .send({
          login: 'user',
          password: 'qwerty123',
        })
        .expect(201);

      expect(res.body.id).toBe(1);
      expect(res.body.login).toBe('user');
      expect(res.body.group).toEqual([1]);
    });

    test('Shouldn`t create with same login', async () => {
      await request(app.getHttpServer())
        .post('/myself')
        .send({
          login: 'user',
          password: 'qwerty123',
        });

      await request(app.getHttpServer())
        .post('/myself')
        .send({
          login: 'user',
          password: 'qwerty123',
        })
        .expect(400);
    });

    test('Shouldn`t create without login', async () => {
      await request(app.getHttpServer())
        .post('/myself')
        .send({password: 'qwerty123'})
        .expect(400);
    });

    test('Shouldn`t create without password', async () => {
      await request(app.getHttpServer())
        .post('/myself')
        .send({login: 'user'})
        .expect(400);
    });
  });
});
