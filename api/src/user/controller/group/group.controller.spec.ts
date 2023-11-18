import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FlagEntity } from '../../../flag/model/flag.entity';
import { PropertyEntity } from '../../../property/model/property.entity';
import { LangEntity } from '../../../lang/model/lang.entity';
import { UserGroupEntity } from '../../model/user-group.entity';
import { UserGroup2stringEntity } from '../../model/user-group2string.entity';
import { UserGroup2flagEntity } from '../../model/user-group2flag.entity';

describe('GroupController', () => {
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

  describe('Group fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/group')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get group instance', async () => {
      await new UserGroupEntity().save();

      const res = await request(app.getHttpServer())
        .get('/group')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(1);
    });

    test('Should get group with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await new UserGroupEntity().save();
      }

      const res = await request(app.getHttpServer())
        .get('/group?limit=2')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(1);
      expect(res.body[1].id).toBe(2);
    });

    test('Should get group with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await new UserGroupEntity().save();
      }

      const res = await request(app.getHttpServer())
        .get('/group?offset=2')
        .expect(200);

      expect(res.body).toHaveLength(8);
      expect(res.body[0].id).toBe(3);
      expect(res.body[7].id).toBe(10);
    });
  });

  describe('Group count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/group/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get group count', async () => {
      for (let i = 0; i < 10; i++) {
        await new UserGroupEntity().save();
      }

      const res = await request(app.getHttpServer())
        .get('/group/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Group with strings', () => {
    test('Should get flag with strings', async () => {
      const parent = await new UserGroupEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new UserGroup2stringEntity(), {parent, property, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/group')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(1);
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
    });

    test('Should get flag with lang strings', async () => {
      const parent = await new UserGroupEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new UserGroup2stringEntity(), {parent, property, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/group')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].property[0].lang).toBe('EN');
      expect(res.body[0].property[0].string).toBe('VALUE');
    });
  });

  describe('Group with flags', () => {
    test('Should get group with flag', async () => {
      const parent = await new UserGroupEntity().save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new UserGroup2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/group')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });
});
