import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FlagEntity } from '../../model/flag.entity';
import { Flag4stringEntity } from '../../model/flag4string.entity';
import { Flag2flagEntity } from '../../model/flag2flag.entity';
import { PropertyEntity } from '../../model/property.entity';
import { LangEntity } from '../../model/lang.entity';

describe('FlagController', () => {
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

  describe('Flag fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get flag with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FlagEntity(), {id: `flag_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/flag?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('flag_0');
      expect(res.body[1].id).toBe('flag_1');
      expect(res.body[2].id).toBe('flag_2');
    });

    test('Should get flag with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FlagEntity(), {id: `flag_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/flag?offset=9')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('flag_9');
    });
  });

  describe('Flag item', () => {
    test('Should get flag instance', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const res = await request(app.getHttpServer())
        .get('/flag/ACTIVE')
        .expect(200);

      expect(res.body.id).toBe('ACTIVE');
    });

    test('Shouldn`t get with wrong id', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const res = await request(app.getHttpServer())
        .get('/flag/WRONG')
        .expect(404);
    });
  });

  describe('Flag count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/flag/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get flag count', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new FlagEntity(), {id: `flag_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/flag/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Flag with strings', () => {
    test('Should get flag with strings', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Flag4stringEntity(), {parent, property, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('ACTIVE');
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
    });

    test('Should get flag with lang strings', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Flag4stringEntity(), {parent, property, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].property[0].lang).toBe('EN');
      expect(res.body[0].property[0].string).toBe('VALUE');
    });
  });

  describe('Flag with flags', () => {
    test('Should get flag with flag', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Flag2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(list.body).toHaveLength(2);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });

    test('Should get flag with multi flags', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      for (let i = 1; i < 4; i++) {
        const flag = await Object.assign(new FlagEntity(), {id: `FLAG_${i}`}).save();
        await Object.assign(new Flag2flagEntity(), {parent, flag}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(list.body[0].flag).toEqual(['FLAG_1', 'FLAG_2', 'FLAG_3']);
    });
  });

  describe('Flag addition', () => {
    test('Should add item', async () => {
      const inst = await request(app.getHttpServer())
        .post('/flag')
        .send({id: 'NEW'})
        .expect(201);

      expect(inst.body.id).toBe('NEW');
    });

    test('Shouldn`t duplicate item', async () => {
      await request(app.getHttpServer())
        .post('/flag')
        .send({id: 'NEW'})
        .expect(201);

      await request(app.getHttpServer())
        .post('/flag')
        .send({id: 'NEW'})
        .expect(400);
    });

    test('Should add with string', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/flag')
        .send({
          id: 'NEW',
          property: [
            {property: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(201);

      expect(inst.body.id).toBe('NEW');
      expect(inst.body.property).toHaveLength(1);
      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].string).toBe('VALUE');
    });

    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .post('/flag')
        .send({
          id: 'NEW',
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.id).toBe('NEW');
      expect(inst.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('Flag updating', () => {
    test('Should update flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      const res = await request(app.getHttpServer())
        .put('/flag/NEW')
        .send({id: 'NEW'})
        .expect(200);

      expect(res.body.id).toBe('NEW');
    });

    test('Should change id', async () => {
      await Object.assign(new FlagEntity(), {id: 'OLD'}).save();
      const res = await request(app.getHttpServer())
        .put('/flag/OLD')
        .send({id: 'UPDATED'})
        .expect(200);

      const count = await request(app.getHttpServer())
        .get('/flag/count')
        .expect(200);

      expect(res.body.id).toBe('UPDATED');
      expect(count.body.count).toBe(1);
    });

    test('Should change id with string', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'OLD'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Flag4stringEntity(), {parent, property, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .put('/flag/OLD')
        .send({id: 'UPDATED', property: [{property: 'NAME', string: 'VALUE'}]})
        .expect(200);

      const count = await request(app.getHttpServer())
        .get('/flag/count')
        .expect(200);

      expect(res.body.id).toBe('UPDATED');
      expect(res.body.property).toEqual([{property: 'NAME', string: 'VALUE'}]);
      expect(count.body.count).toBe(1);
    });

    test('Should change id with flag', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'OLD'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Flag2flagEntity(), {parent, flag}).save();

      const res = await request(app.getHttpServer())
        .put('/flag/OLD')
        .send({id: 'UPDATED', flag: ['FLAG']})
        .expect(200);

      const count = await request(app.getHttpServer())
        .get('/flag/count')
        .expect(200);

      expect(res.body.id).toBe('UPDATED');
      expect(res.body.flag).toEqual(['FLAG']);
      expect(count.body.count).toBe(2);
    });

    test('Should add string', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .put('/flag/NEW')
        .send({
          id: 'NEW',
          property: [
            {property: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(200);

      expect(res.body.property).toHaveLength(1);
      expect(res.body.property[0].property).toBe('NAME');
      expect(res.body.property[0].string).toBe('VALUE');
    });

    test('Should add flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const res = await request(app.getHttpServer())
        .put('/flag/NEW')
        .send({
          id: 'NEW',
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(res.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('Flag deletion', () => {
    test('Should delete', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .delete('/flag/ACTIVE')
        .expect(200);

      expect(inst.body).toEqual(['ACTIVE']);
    });
  });
});
