import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { ContactEntity, UserContactType } from '../../model/contact/contact.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { UserEntity } from '../../model/user/user.entity';
import { User4stringEntity } from '../../model/user/user4string.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { User4pointEntity } from '../../model/user/user4point.entity';
import { User2flagEntity } from '../../model/user/user2flag.entity';

describe('UserController', () => {
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

  describe('UserEntity fields', () => {
    test('Should get empty list', async () => {
      await Object.assign(new UserEntity(), {login: 'USER'}).save();

      const res = await request(app.getHttpServer())
        .get('/personal/user')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toHaveLength(36);
      expect(res.body[0].login).toBe('USER');
    });

    test('Should get personal item', async () => {
      await Object.assign(new UserEntity(), {id: '222', login: 'USER'}).save();

      const res = await request(app.getHttpServer())
        .get(`/personal/user/222`)
        .expect(200);

      expect(res.body.id).toBe('222');
      expect(res.body.login).toBe('USER');
    });

    test('Should get personal list', async () => {
      await Object.assign(new UserEntity(), {id: '111', login: 'USER'}).save();

      const res = await request(app.getHttpServer())
        .get(`/personal/user`)
        .expect(200);

      expect(res.body[0].id).toBe('111');
      expect(res.body[0].login).toBe('USER');
    });

    test('Should get personal with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new UserEntity(), {login: `USER_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get(`/personal/user?limit=3`)
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].login).toBe('USER_0');
      expect(res.body[1].login).toBe('USER_1');
      expect(res.body[2].login).toBe('USER_2');
    });

    test('Should get personal with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new UserEntity(), {login: `USER_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get(`/personal/user?offset=7`)
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].login).toBe('USER_7');
      expect(res.body[1].login).toBe('USER_8');
      expect(res.body[2].login).toBe('USER_9');
    });
  });

  describe('UserEntity count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/personal/user/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get personal count', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new UserEntity(), {login: `USER_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/user/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('UserEntity with strings', () => {
    test('Should get personal with strings', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new UserEntity(), {login: 'USER'}).save();
      await Object.assign(new User4stringEntity(), {parent, attribute, string: 'John'}).save();

      const list = await request(app.getHttpServer())
        .get('/personal/user')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toHaveLength(36);
      expect(list.body[0].attribute).toEqual([{attribute: 'NAME', string: 'John'}]);
    });
  });

  describe('UserEntity with flags', () => {
    test('Should get personal with flag', async () => {
      const parent = await Object.assign(new UserEntity(), {login: 'USER'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new User2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/personal/user')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });
  });

  describe('UserEntity with points', () => {
    test('Should get section with point', async () => {
      const parent = await Object.assign(new UserEntity(), {login: 'USER'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'GENDER'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'SEX'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'MAIL', directory}).save();

      await Object.assign(new User4pointEntity(), {point, parent, attribute}).save();

      const list = await request(app.getHttpServer())
        .get('/personal/user')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].attribute).toHaveLength(1);
      expect(list.body[0].attribute[0].attribute).toBe('SEX');
      expect(list.body[0].attribute[0].point).toBe('MAIL');
      expect(list.body[0].attribute[0].directory).toBe('GENDER');
    });
  });

  describe('UserEntity addition', () => {
    test('Should add personal', async () => {
      const inst = await request(app.getHttpServer())
        .post('/personal/user')
        .send({login: 'user'})
        .expect(201);

      expect(inst.body.id).toHaveLength(36)
      expect(inst.body.login).toBe('user');
    });

    test('Shouldn`t add without login', async () => {
      await request(app.getHttpServer())
        .post('/personal/user')
        .send({})
        .expect(400);
    });

    test('Should add personal with strings', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/personal/user')
        .send({
          login: 'user',
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Should add personal with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .post('/personal/user')
        .send({
          login: 'user',
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });

    test('Should add personal with contact', async () => {
      await Object.assign(new ContactEntity(), {id: 'PHONE', type: UserContactType.PHONE}).save();

      const inst = await request(app.getHttpServer())
        .post('/personal/user')
        .send({
          login: 'user',
          contact: [{contact: 'PHONE', value: 'VALUE'}],
        })
        .expect(201);

      expect(inst.body.contact).toHaveLength(1);
      expect(inst.body.contact[0].contact).toBe('PHONE');
      expect(inst.body.contact[0].value).toBe('VALUE');
    });

    test('Shouldn`t add with wrong contact', async () => {
      await Object.assign(new ContactEntity(), {id: 'PHONE', type: UserContactType.PHONE}).save();

      await request(app.getHttpServer())
        .post('/personal/user')
        .send({
          login: 'user',
          contact: [{contact: 'WRONG', value: 'VALUE'}],
        })
        .expect(400);
    });
  });

  describe('UserEntity update', () => {
    test('Should update', async () => {
      await Object.assign(new UserEntity(), {id: '111', login: 'user'}).save();

      const res = await request(app.getHttpServer())
        .put('/personal/user/111')
        .send({login: 'user'})
        .expect(200);

      expect(res.body.id).toBe('111');
      expect(res.body.login).toBe('user');
    });

    test('Shouldn`t update without login', async () => {
      await Object.assign(new UserEntity(), {id: '111', login: 'user'}).save();

      await request(app.getHttpServer())
        .put('/personal/user/111')
        .send({})
        .expect(400);
    });

    test('Should add strings', async () => {
      await Object.assign(new UserEntity(), {id: '111', login: 'user'}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .put('/personal/user/111')
        .send({
          login: 'user',
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(200);

      expect(res.body.attribute[0].attribute).toBe('NAME');
      expect(res.body.attribute[0].string).toBe('VALUE');
    });

    test('Should update strings', async () => {
      const parent = await Object.assign(new UserEntity(), {id: '111', login: 'user'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'OLD'}).save();
      await Object.assign(new AttributeEntity(), {id: 'NEW'}).save();
      await Object.assign(new User4stringEntity(), {parent, attribute, string: 'OLD'}).save();

      const res = await request(app.getHttpServer())
        .put('/personal/user/111')
        .send({
          login: 'user',
          attribute: [{attribute: 'NEW', string: 'NEW'}],
        })
        .expect(200);

      expect(res.body.attribute).toHaveLength(1);
      expect(res.body.attribute[0].attribute).toBe('NEW');
      expect(res.body.attribute[0].string).toBe('NEW');
    });

    test('Should add flag', async () => {
      await Object.assign(new UserEntity(), {id: '111', login: 'user'}).save();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const res = await request(app.getHttpServer())
        .put('/personal/user/111')
        .send({
          login: 'user',
          flag: ['NEW'],
        })
        .expect(200);

      expect(res.body.flag).toEqual(['NEW']);
    });

    test('Should update flag', async () => {
      const parent = await Object.assign(new UserEntity(), {id: '111', login: 'user'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'OLD'}).save();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new User2flagEntity(), {parent, flag}).save();

      const res = await request(app.getHttpServer())
        .put('/personal/user/111')
        .send({
          login: 'user',
          flag: ['NEW'],
        })
        .expect(200);

      expect(res.body.flag).toEqual(['NEW']);
    });
  });

  describe('UserEntity deletion', () => {
    test('Should delete', async () => {
      await Object.assign(new UserEntity(), {id: '1', login: 'USER'}).save();

      const drop = await request(app.getHttpServer())
        .delete('/personal/user/1');

      expect(drop.body).toEqual([1]);

      const rest = await request(app.getHttpServer())
        .get('/personal/user');

      expect(rest.body).toEqual([]);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await Object.assign(new UserEntity(), {id: '1', login: 'USER'}).save();

      await request(app.getHttpServer())
        .delete('/personal/user/WRONG')
        .expect(404);
    });
  });
});