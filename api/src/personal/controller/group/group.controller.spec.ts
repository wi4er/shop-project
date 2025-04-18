import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { GroupEntity } from '../../model/group.entity';
import { Group4stringEntity } from '../../model/group4string.entity';
import { Group2flagEntity } from '../../model/group2flag.entity';
import { PropertyEntity } from '../../../settings/model/property.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';

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
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      const res = await request(app.getHttpServer())
        .get('/group/111')
        .expect(200);

      expect(res.body.id).toBe('111');
    });

    test('Should get group with parent', async () => {
      const parent = await Object.assign(new GroupEntity(), {id: '111'}).save();
      await Object.assign(new GroupEntity(), {id: '222', parent}).save();

      const res = await request(app.getHttpServer())
        .get('/group/222')
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
        .get('/group')
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
        .get('/group?limit=2')
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
        .get('/group?offset=2')
        .expect(200);

      expect(res.body).toHaveLength(8);
      expect(res.body[0].id).toBe('2');
      expect(res.body[7].id).toBe('9');
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
        await new GroupEntity().save();
      }

      const res = await request(app.getHttpServer())
        .get('/group/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Group with strings', () => {
    test('Should get flag with strings', async () => {
      const parent = await new GroupEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Group4stringEntity(), {parent, property, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/group')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
    });

    test('Should get flag with lang strings', async () => {
      const parent = await new GroupEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Group4stringEntity(), {parent, property, lang, string: 'VALUE'}).save();

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
      const parent = await new GroupEntity().save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Group2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/group')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });

  describe('Group addition', () => {
    test('Should add group', async () => {
      const inst = await request(app.getHttpServer())
        .post('/group')
        .expect(201);

      expect(inst.body.id).toHaveLength(36);
    });

    test('Should add with parent', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      const inst = await request(app.getHttpServer())
        .post('/group')
        .send({parent: '111'})
        .expect(201);

      expect(inst.body.id).toHaveLength(36);
      expect(inst.body.parent).toBe('111');
    });

    test('Shouldn`t add with wrong parent', async () => {
      await new GroupEntity().save();
      const inst = await request(app.getHttpServer())
        .post('/group')
        .send({
          parent: 777,
        })
        .expect(400);
    });

    test('Should add with strings', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/group')
        .send({
          property: [{property: 'NAME', string: 'VALUE'}],
        })
        .expect(201);

      expect(inst.body.property).toHaveLength(1);
      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].string).toBe('VALUE');
    });

    test('Shouldn`t with wrong property', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/group')
        .send({
          property: [{property: 'WRONG', string: 'VALUE'}],
        })
        .expect(400);
    });

    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'OLD'}).save();

      const inst = await request(app.getHttpServer())
        .post('/group')
        .send({
          flag: ['OLD'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['OLD']);
    });

    test('Should n`t add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'OLD'}).save();

      const inst = await request(app.getHttpServer())
        .post('/group')
        .send({flag: ['WRONG']})
        .expect(400);
    });
  });

  describe('Group update', () => {
    test('Should update group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      const inst = await request(app.getHttpServer())
        .put('/group/111')
        .expect(200);

      expect(inst.body.id).toBe('111');
    });

    test('Should add parent to group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      await Object.assign(new GroupEntity(), {id: '222'}).save();

      const inst = await request(app.getHttpServer())
        .put('/group/222')
        .send({parent: '111'})
        .expect(200);

      expect(inst.body.id).toBe('222');
      expect(inst.body.parent).toBe('111');
    });

    test('Shouldn`t add wrong parent', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      await Object.assign(new GroupEntity(), {id: '222'}).save();

      await request(app.getHttpServer())
        .put('/group/222')
        .send({parent: '777'})
        .expect(400);
    });

    test('Should add strings', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      const inst = await request(app.getHttpServer())
        .put('/group/111')
        .send({
          property: [{property: 'NAME', string: 'VALUE'}],
        })
        .expect(200);

      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].string).toBe('VALUE');
    });

    test('Shouldn`t update wrong property', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      await request(app.getHttpServer())
        .put('/group/111')
        .send({
          property: [{property: 'WRONG', string: 'VALUE'}],
        })
        .expect(400);
    });

    test('Should add flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      const inst = await request(app.getHttpServer())
        .put('/group/111')
        .send({flag: ['NEW']})
        .expect(200);

      expect(inst.body.flag).toEqual(['NEW']);
    });

    test('Shouldn`t add wrong flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      await request(app.getHttpServer())
        .put('/group/111')
        .send({flag: ['WRONG']})
        .expect(400);
    });
  });

  describe('Group delete', () => {
    test('Should delete group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      const inst = await request(app.getHttpServer())
        .delete('/group/111')
        .expect(200);

      expect(inst.body).toEqual(['111']);
    });

    test('Shouldn`t delete with wrong group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      await request(app.getHttpServer())
        .delete('/group/777')
        .expect(404);
    });
  });
});
