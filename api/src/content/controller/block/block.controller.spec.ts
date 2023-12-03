import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { BlockEntity } from '../../model/block.entity';
import { Block2stringEntity } from '../../model/block2string.entity';
import { Block2flagEntity } from '../../model/block2flag.entity';
import { DirectoryEntity } from '../../../directory/model/directory.entity';
import { PointEntity } from '../../../directory/model/point.entity';
import { Block2pointEntity } from '../../model/block2point.entity';
import { PropertyEntity } from '../../../settings/model/property.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';

describe('BlockController', () => {
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

  describe('Content block fields', () => {
    test('Should get empty block list', async () => {
      const list = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(list.body).toEqual([]);
    });

    test('Should get block list', async () => {
      await new BlockEntity().save();

      const list = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe(1);
    });

    test('Should get block item', async () => {
      await new BlockEntity().save();

      const list = await request(app.getHttpServer())
        .get('/block/1')
        .expect(200);

      expect(list.body.id).toBe(1);
    });

    test('Should get block with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await new BlockEntity().save();
      }

      const list = await request(app.getHttpServer())
        .get('/block?limit=4')
        .expect(200);

      expect(list.body).toHaveLength(4);
      expect(list.body[0].id).toBe(1);
      expect(list.body[1].id).toBe(2);
      expect(list.body[2].id).toBe(3);
      expect(list.body[3].id).toBe(4);
    });

    test('Should get block with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await new BlockEntity().save();
      }

      const list = await request(app.getHttpServer())
        .get('/block?offset=5')
        .expect(200);

      expect(list.body).toHaveLength(5);
      expect(list.body[0].id).toBe(6);
      expect(list.body[1].id).toBe(7);
      expect(list.body[2].id).toBe(8);
      expect(list.body[3].id).toBe(9);
      expect(list.body[4].id).toBe(10);
    });
  });

  describe('Content block count', () => {
    test('Should get empty block count', async () => {
      const list = await request(app.getHttpServer())
        .get('/block/count')
        .expect(200);

      expect(list.body).toEqual({count: 0});
    });

    test('Should get block count', async () => {
      for (let i = 0; i < 10; i++) {
        await new BlockEntity().save();
      }

      const list = await request(app.getHttpServer())
        .get('/block/count')
        .expect(200);

      expect(list.body).toEqual({count: 10});
    });
  });

  describe('Content element with strings', () => {
    test('Should get block with properties', async () => {
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Block2stringEntity(), {parent, property, string: 'VALUE'}).save();

      const list = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].string).toBe('VALUE');
      expect(list.body[0].property[0].property).toBe('NAME');
    });
  });

  describe('Content block with flags', () => {
    test('Should get block with flag', async () => {
      const parent = await new BlockEntity().save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Block2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });
  });

  describe('Content element with point', () => {
    test('Should get element with point', async () => {
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Block2pointEntity(), {parent, property, point}).save();

      const list = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].point).toBe('LONDON');
      expect(list.body[0].property[0].directory).toBe('CITY');
    });
  });

  describe('Content block addition', () => {
    test('Should add block', async () => {
      const inst = await request(app.getHttpServer())
        .post('/block')
        .send({})
        .expect(201);

      expect(inst.body.id).toBe(1);
    });

    test('Should add with strings', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/block')
        .send({
          property: [
            {property: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(201);

      expect(inst.body.property).toHaveLength(1);
      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].string).toBe('VALUE');
    });

    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .post('/block')
        .send({
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('Content block update', () => {
    test('Should add block', async () => {
      await new BlockEntity().save();

      const inst = await request(app.getHttpServer())
        .put('/block/1')
        .send({})
        .expect(200);

      expect(inst.body.id).toBe(1);
    });

    test('Should add strings', async () => {
      await new BlockEntity().save();
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .put('/block/1')
        .send({
          property: [
            {property: 'NAME', string: 'John'},
          ],
        })
        .expect(200);

      expect(inst.body.property).toHaveLength(1);
      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].string).toBe('John');
    });

    test('Should add flags', async () => {
      await new BlockEntity().save();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const inst = await request(app.getHttpServer())
        .put('/block/1')
        .send({
          flag: ['NEW'],
        })
        .expect(200);

      expect(inst.body.flag).toEqual(['NEW']);
    });
  });

  describe('Content block deletion', () => {
    test('Should delete block', async () => {
      await new BlockEntity().save();

      const inst = await request(app.getHttpServer())
        .delete('/block/1')
        .expect(200);

      expect(inst.body).toEqual([1]);
    });
  });
});
