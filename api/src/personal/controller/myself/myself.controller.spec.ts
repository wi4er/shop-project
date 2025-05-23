import { Test } from '@nestjs/testing';
import { UserEntity } from '../../model/user/user.entity';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { GroupEntity } from '../../model/group/group.entity';
import { User2groupEntity } from '../../model/user/user2group.entity';
import * as process from 'process';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('MyselfController', () => {
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

  describe('Getting myself', () => {
    test('Should get myself', async () => {
      await Object.assign(new UserEntity(), {
        id: 'user',
        login: 'user',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();

      const {headers} = await request(app.getHttpServer())
        .post(`/personal/auth`)
        .send({
          login: 'user',
          password: 'qwerty',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/personal/myself`)
        .set('cookie', headers['set-cookie']);

      expect(res.body.id).toBe('user');
      expect(res.body.login).toBe('user');
    });

    test('Should get with group', async () => {
      const group = await Object.assign(new GroupEntity(), {id: 'group'}).save();
      const parent = await Object.assign(new UserEntity(), {
        id: 'user',
        login: 'user',
        hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
      }).save();
      await Object.assign(new User2groupEntity(), {parent, group}).save();

      const {headers} = await request(app.getHttpServer())
        .post(`/personal/auth`)
        .send({
          login: 'user',
          password: 'qwerty',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/personal/myself`)
        .set('cookie', headers['set-cookie'])
        .expect(200);

      expect(res.body.id).toBe('user');
      expect(res.body.login).toBe('user');
      expect(res.body.group).toEqual(['group']);
    });

    test('Shouldn`t get without authorization', async () => {
      await request(app.getHttpServer())
        .get(`/personal/myself`)
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
        .post(`/personal/auth`)
        .send({
          login: 'user',
          password: 'qwerty',
        });

      const res = await request(app.getHttpServer())
        .put(`/personal/myself`)
        .send({
          login: 'admin',
          hash: '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',
          group: [],
          contact: [],
          property: [],
        })
        .set('cookie', headers['set-cookie'])
        .expect(200);

      expect(res.body.id).toHaveLength(36);
      expect(res.body.login).toBe('admin');
    });

    test('Shouldn`t update without authorization', async () => {
      const res = await request(app.getHttpServer())
        .put(`/personal/myself`)
        .send({
          login: 'admin',
        })
        .expect(403);
    });
  });

  describe('UserEntity registration', () => {
    test('Should register personal', async () => {
      const res = await request(app.getHttpServer())
        .post('/personal/myself')
        .send({
          login: 'user',
          password: 'qwerty123',
        })
        .expect(201);

      expect(res.body.id).toHaveLength(36);
      expect(res.body.login).toBe('user');
      expect(res.body.group).toEqual([]);
    });

    test('Should register with public group', async () => {
      const group = await Object.assign(new GroupEntity(), {id: 'PUBLIC'}).save();
      process.env.PUBLIC_GROUP = String(group.id);

      const res = await request(app.getHttpServer())
        .post('/personal/myself')
        .send({
          login: 'user',
          password: 'qwerty123',
        })
        .expect(201);

      expect(res.body.id).toHaveLength(36);
      expect(res.body.login).toBe('user');
      expect(res.body.group).toEqual(['PUBLIC']);
    });

    test('Shouldn`t create with same login', async () => {
      await request(app.getHttpServer())
        .post('/personal/myself')
        .send({
          login: 'user',
          password: 'qwerty123',
        });

      await request(app.getHttpServer())
        .post('/personal/myself')
        .send({
          login: 'user',
          password: 'qwerty123',
        })
        .expect(400);
    });

    test('Shouldn`t create without login', async () => {
      await request(app.getHttpServer())
        .post('/personal/myself')
        .send({password: 'qwerty123'})
        .expect(400);
    });

    test('Shouldn`t create without password', async () => {
      await request(app.getHttpServer())
        .post('/personal/myself')
        .send({login: 'user'})
        .expect(400);
    });
  });
});
