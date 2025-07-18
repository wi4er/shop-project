import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { GroupEntity } from '../../model/group/group.entity';
import { Group4stringEntity } from '../../model/group/group4string.entity';
import { Group2flagEntity } from '../../model/group/group2flag.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('GroupController', () => {
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

  describe('Group list', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/personal/group')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get group with parent', async () => {
      const parent = await Object.assign(new GroupEntity(), {id: '111'}).save();
      await Object.assign(new GroupEntity(), {id: '222', parent}).save();

      const res = await request(app.getHttpServer())
        .get('/personal/group/222')
        .expect(200);

      expect(res.body.id).toBe('222');
      expect(res.body.parent).toBe('111');
    });

    test('Should get list with parent', async () => {
      const parent = await Object.assign(new GroupEntity(), {id: '111'}).save();

      for (let i = 0; i < 4; i++) {
        await Object.assign(new GroupEntity(), {parent: i % 2 ? parent : null}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/group')
        .expect(200);

      expect(res.body).toHaveLength(5);
      expect(res.body[0].parent).toBe('111');
      expect(res.body[1].parent).toBeNull();
      expect(res.body[2].parent).toBe('111');
      expect(res.body[3].parent).toBeNull()
    });

    test('Should get group with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new GroupEntity(), {id: String(i)}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/group?limit=2')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe('9');
      expect(res.body[1].id).toBe('8');
    });

    test('Should get group with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new GroupEntity(), {id: String(i)}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/group?offset=2')
        .expect(200);

      expect(res.body).toHaveLength(8);
      expect(res.body[0].id).toBe('7');
      expect(res.body[7].id).toBe('0');
    });
  });

  describe('Group item', () => {
    test('Should get group item', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      const res = await request(app.getHttpServer())
        .get('/personal/group/111')
        .expect(200);

      expect(res.body.id).toBe('111');
    });

    test('Shouldn`t get group item with wrong id ', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      await request(app.getHttpServer())
        .get('/personal/group/777')
        .expect(404);
    });
  });

  describe('Group count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/personal/group/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get group count', async () => {
      for (let i = 0; i < 10; i++) {
        await new GroupEntity().save();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/group/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Group with strings', () => {
    test('Should get flag with strings', async () => {
      const parent = await new GroupEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Group4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/personal/group')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });

    test('Should get flag with lang strings', async () => {
      const parent = await new GroupEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Group4stringEntity(), {parent, attribute, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/personal/group')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute[0].lang).toBe('EN');
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });
  });

  describe('Group with flags', () => {
    test('Should get group with flag', async () => {
      const parent = await new GroupEntity().save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Group2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/personal/group')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });
});
