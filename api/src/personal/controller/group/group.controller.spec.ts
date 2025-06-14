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

  describe('GroupEntity fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/personal/group')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get group instance', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      const res = await request(app.getHttpServer())
        .get('/personal/group/111')
        .expect(200);

      expect(res.body.id).toBe('111');
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
      expect(res.body[1].parent).toBeUndefined();
      expect(res.body[2].parent).toBe('111');
      expect(res.body[3].parent).toBeUndefined();
      expect(res.body[4].parent).toBe('111');
    });

    test('Should get group with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new GroupEntity(), {id: String(i)}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/group?limit=2')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe('0');
      expect(res.body[1].id).toBe('1');
    });

    test('Should get group with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new GroupEntity(), {id: String(i)}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/personal/group?offset=2')
        .expect(200);

      expect(res.body).toHaveLength(8);
      expect(res.body[0].id).toBe('2');
      expect(res.body[7].id).toBe('9');
    });
  });

  describe('GroupEntity count', () => {
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

  describe('GroupEntity with strings', () => {
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

  describe('GroupEntity with flags', () => {
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

  describe('GroupEntity addition', () => {
    test('Should add group', async () => {
      const inst = await request(app.getHttpServer())
        .post('/personal/group')
        .expect(201);

      expect(inst.body.id).toHaveLength(36);
    });

    test('Should add with parent', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      const inst = await request(app.getHttpServer())
        .post('/personal/group')
        .send({parent: '111'})
        .expect(201);

      expect(inst.body.id).toHaveLength(36);
      expect(inst.body.parent).toBe('111');
    });

    test('Shouldn`t add with wrong parent', async () => {
      await new GroupEntity().save();
      const inst = await request(app.getHttpServer())
        .post('/personal/group')
        .send({
          parent: 777,
        })
        .expect(400);
    });

    test('Should add with strings', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/personal/group')
        .send({
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Shouldn`t with wrong attribute', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .post('/personal/group')
        .send({
          attribute: [{attribute: 'WRONG', string: 'VALUE'}],
        })
        .expect(400);
    });

    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'OLD'}).save();

      const inst = await request(app.getHttpServer())
        .post('/personal/group')
        .send({
          flag: ['OLD'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['OLD']);
    });

    test('Should n`t add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'OLD'}).save();

      await request(app.getHttpServer())
        .post('/personal/group')
        .send({flag: ['WRONG']})
        .expect(400);
    });
  });

  describe('GroupEntity update', () => {
    test('Should update group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      const inst = await request(app.getHttpServer())
        .put('/personal/group/111')
        .expect(200);

      expect(inst.body.id).toBe('111');
    });

    test('Should add parent to group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      await Object.assign(new GroupEntity(), {id: '222'}).save();

      const inst = await request(app.getHttpServer())
        .put('/personal/group/222')
        .send({parent: '111'})
        .expect(200);

      expect(inst.body.id).toBe('222');
      expect(inst.body.parent).toBe('111');
    });

    test('Shouldn`t add wrong parent', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      await Object.assign(new GroupEntity(), {id: '222'}).save();

      await request(app.getHttpServer())
        .put('/personal/group/222')
        .send({parent: '777'})
        .expect(400);
    });

    test('Should add strings', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      const inst = await request(app.getHttpServer())
        .put('/personal/group/111')
        .send({
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(200);

      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Shouldn`t update wrong attribute', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      await request(app.getHttpServer())
        .put('/personal/group/111')
        .send({
          attribute: [{attribute: 'WRONG', string: 'VALUE'}],
        })
        .expect(400);
    });

    test('Should add flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      const inst = await request(app.getHttpServer())
        .put('/personal/group/111')
        .send({flag: ['NEW']})
        .expect(200);

      expect(inst.body.flag).toEqual(['NEW']);
    });

    test('Shouldn`t add wrong flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      await request(app.getHttpServer())
        .put('/personal/group/111')
        .send({flag: ['WRONG']})
        .expect(400);
    });
  });

  describe('GroupEntity delete', () => {
    test('Should delete group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      const inst = await request(app.getHttpServer())
        .delete('/personal/group/111')
        .expect(200);

      expect(inst.body).toEqual(['111']);
    });

    test('Shouldn`t delete with wrong group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      await request(app.getHttpServer())
        .delete('/personal/group/777')
        .expect(404);
    });
  });
});
