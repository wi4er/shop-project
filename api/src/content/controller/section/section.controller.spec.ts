import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { BlockEntity } from '../../model/block.entity';
import { SectionEntity } from '../../model/section.entity';
import { PropertyEntity } from '../../../property/model/property.entity';
import { Section2stringEntity } from '../../model/section2string.entity';
import { FlagEntity } from '../../../flag/model/flag.entity';
import { Section2flagEntity } from '../../model/section2flag.entity';
import { DirectoryEntity } from '../../../directory/model/directory.entity';
import { PointEntity } from '../../../directory/model/point.entity';
import { Section2pointEntity } from '../../model/section2point.entity';

describe('SectionController', () => {
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

  describe('Content section getting', () => {
    test('Should get empty section list', async () => {
      const list = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(list.body).toEqual([]);
    });

    test('Should get section list', async () => {
      await new BlockEntity().save();
      await Object.assign(new SectionEntity(), {block: 1}).save();

      const list = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe(1);
      expect(list.body[0].block).toBe(1);
    });

    test('Should get list with block filter', async () => {
      await new BlockEntity().save();
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new SectionEntity(), {block: i % 2 + 1}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/section?filter[block]=1')
        .expect(200);

      expect(list.body).toHaveLength(5);
    });

    test('Should get section item', async () => {
      await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block: 1}).save();
      await Object.assign(new SectionEntity(), {block: 1, parent}).save();

      const list = await request(app.getHttpServer())
        .get('/section/2')
        .expect(200);

      expect(list.body.id).toBe(2);
      expect(list.body.block).toBe(1);
      expect(list.body.parent).toBe(1);
    });

    test('Should get section with parent', async () => {
      await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block: 1}).save();
      await Object.assign(new SectionEntity(), {block: 1, parent}).save();

      const list = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(list.body).toHaveLength(2);
      expect(list.body[1].id).toBe(2);
      expect(list.body[1].parent).toBe(1);
    });

    test('Should get with limit', async () => {
      await new BlockEntity().save();
      for (let i = 0; i < 10; i++) {
        await Object.assign(new SectionEntity(), {block: 1}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/section?limit=3')
        .expect(200);

      expect(list.body).toHaveLength(3);
      expect(list.body[0].id).toBe(1);
      expect(list.body[2].id).toBe(3);
    });

    test('Should get with offset', async () => {
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new SectionEntity(), {block: 1}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/section?offset=6')
        .expect(200);

      expect(list.body).toHaveLength(4);
      expect(list.body[0].id).toBe(7);
      expect(list.body[3].id).toBe(10);
    });
  });

  describe('Content section count', () => {
    test('Should get empty section count', async () => {
      const list = await request(app.getHttpServer())
        .get('/section/count')
        .expect(200);

      expect(list.body).toEqual({count: 0});
    });

    test('Should get empty section count', async () => {
      await new BlockEntity().save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new SectionEntity(), {block: 1}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/section/count')
        .expect(200);

      expect(list.body).toEqual({count: 10});
    });
  });

  describe('Content section with strings', () => {
    test('Should get section with properties', async () => {
      const block = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      await Object.assign(new Section2stringEntity(), {parent, property, string: 'VALUE'}).save();

      const list = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].string).toBe('VALUE');
      expect(list.body[0].property[0].property).toBe('NAME');
    });
  });

  describe('Content section with flags', () => {
    test('Should get section with flag', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Section2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['ACTIVE']);
    });
  });

  describe('Content section with points', () => {
    test('Should get section with point', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Section2pointEntity(), {point, parent, property}).save();

      const list = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].property).toHaveLength(1);
      expect(list.body[0].property[0].property).toBe('CURRENT');
      expect(list.body[0].property[0].point).toBe('LONDON');
      expect(list.body[0].property[0].directory).toBe('CITY');
    });
  });

  describe('Content section flag filter', () => {
    test('Should get section with flag filter', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Section2flagEntity(), {parent, flag, string: 'VALUE'}).save();

      await Object.assign(new SectionEntity, {block}).save();

      const list = await request(app.getHttpServer())
        .get('/section?filter[flag][eq]=ACTIVE')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0]['flag']).toEqual(['ACTIVE']);
    });

    test('Should get empty list with flag filter', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();

      for (let i = 0; i < 10; i++) {
        const flag = await Object.assign(new FlagEntity(), {id: `ACTIVE_${i}`}).save();
        await Object.assign(new Section2flagEntity(), {parent, flag, string: 'VALUE'}).save();
      }

      await Object.assign(new SectionEntity, {block}).save();

      const list = await request(app.getHttpServer())
        .get('/section?filter[flag][eq]=WRONG')
        .expect(200);

      expect(list.body).toHaveLength(0);
    });
  });

  describe('Content section addition', () => {
    test('Should add section', async () => {
      await new BlockEntity().save();
      await Object.assign(new SectionEntity(), {block: 1}).save();

      const inst = await request(app.getHttpServer())
        .post('/section')
        .send({block: 1, parent: 1})
        .expect(201);

      console.log(inst.body);

      expect(inst.body['id']).toBe(2);
      expect(inst.body['block']).toBe(1);
      expect(inst.body['parent']).toBe(1);
    });

    test('Should add without parent', async () => {
      await new BlockEntity().save();

      const inst = await request(app.getHttpServer())
        .post('/section')
        .send({block: 1})
        .expect(201);

      expect(inst.body['id']).toBe(1);
      expect(inst.body['block']).toBe(1);
    });

    test('Shouldn`t add section without block', async () => {
      const inst = await request(app.getHttpServer())
        .post('/section')
        .send({})
        .expect(400);
    });

    test('Shouldn`t add with wrong block', async () => {
      await new BlockEntity().save();
      await request(app.getHttpServer())
        .post('/section')
        .send({block: 2})
        .expect(400);
    });
  });
});
