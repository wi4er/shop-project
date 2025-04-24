import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FlagEntity } from '../../model/flag.entity';
import { Flag4stringEntity } from '../../model/flag4string.entity';
import { Flag2flagEntity } from '../../model/flag2flag.entity';
import { AttributeEntity } from '../../model/attribute.entity';
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
      await Object.assign(new FlagEntity(), {
        id: 'ACTIVE',
        color: 'FFF',
        icon: 'folder',
      }).save();

      const res = await request(app.getHttpServer())
        .get('/flag/ACTIVE')
        .expect(200);

      expect(res.body.id).toBe('ACTIVE');
      expect(res.body.color).toBe('FFF');
      expect(res.body.icon).toBe('folder');
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
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Flag4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('ACTIVE');
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });

    test('Should get flag with lang strings', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Flag4stringEntity(), {parent, attribute, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/flag')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute[0].lang).toBe('EN');
      expect(res.body[0].attribute[0].string).toBe('VALUE');
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
    describe('Flag addition with fields', () => {
      test('Should add item', async () => {
        const inst = await request(app.getHttpServer())
          .post('/flag')
          .send({id: 'NEW'})
          .expect(201);

        expect(inst.body.id).toBe('NEW');
      });

      test('Should add with fields', async () => {
        const inst = await request(app.getHttpServer())
          .post('/flag')
          .send({
            id: 'NEW',
            color: '0F0',
            icon: 'folder',
            iconSvg: 'SOME',
          })
          .expect(201);

        expect(inst.body.id).toBe('NEW');
        expect(inst.body.color).toBe('0F0');
        expect(inst.body.icon).toBe('folder');
        expect(inst.body.iconSvg).toBe('SOME');
      });

      test('Shouldn`t add with blank id', async () => {
        await request(app.getHttpServer())
          .post('/flag')
          .send({id: ''})
          .expect(400);
      });

      test('Shouldn`t add without id', async () => {
        await request(app.getHttpServer())
          .post('/flag')
          .send({})
          .expect(400);
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
    });

    describe('Flag addition with strings', () => {
      test('Should add with string', async () => {
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        const inst = await request(app.getHttpServer())
          .post('/flag')
          .send({
            id: 'NEW',
            attribute: [
              {attribute: 'NAME', string: 'VALUE'},
            ],
          })
          .expect(201);

        expect(inst.body.id).toBe('NEW');
        expect(inst.body.attribute).toHaveLength(1);
        expect(inst.body.attribute[0].attribute).toBe('NAME');
        expect(inst.body.attribute[0].string).toBe('VALUE');
      });

      test('Shouldn`r add with wrong attribute', async () => {
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        await request(app.getHttpServer())
          .post('/flag')
          .send({
            id: 'NEW',
            attribute: [
              {attribute: 'WRONG', string: 'VALUE'},
            ],
          })
          .expect(400);
      });
    });

    describe('Flag addition with flag', () => {
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

      test('Shouldn`t add with wrong flag', async () => {
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        await request(app.getHttpServer())
          .post('/flag')
          .send({
            id: 'NEW',
            flag: ['WRONG'],
          })
          .expect(400);
      });
    });
  });

  describe('Flag updating', () => {
    describe('Flag updating with fields', () => {
      test('Should update flag', async () => {
        await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
        const res = await request(app.getHttpServer())
          .put('/flag/NEW')
          .send({id: 'NEW'})
          .expect(200);

        expect(res.body.id).toBe('NEW');
      });

      test('Should add fields', async () => {
        await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
        const res = await request(app.getHttpServer())
          .put('/flag/NEW')
          .send({
            id: 'NEW',
            color: 'FFF',
            icon: 'folder',
            iconSvg: 'SOME',
          })
          .expect(200);

        expect(res.body.id).toBe('NEW');
        expect(res.body.color).toBe('FFF');
        expect(res.body.icon).toBe('folder');
        expect(res.body.iconSvg).toBe('SOME');
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
    });

    test('Should change id with string', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'OLD'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Flag4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .put('/flag/OLD')
        .send({id: 'UPDATED', attribute: [{attribute: 'NAME', string: 'VALUE'}]})
        .expect(200);

      const count = await request(app.getHttpServer())
        .get('/flag/count')
        .expect(200);

      expect(res.body.id).toBe('UPDATED');
      expect(res.body.attribute).toEqual([{attribute: 'NAME', string: 'VALUE'}]);
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
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .put('/flag/NEW')
        .send({
          id: 'NEW',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(200);

      expect(res.body.attribute).toHaveLength(1);
      expect(res.body.attribute[0].attribute).toBe('NAME');
      expect(res.body.attribute[0].string).toBe('VALUE');
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
