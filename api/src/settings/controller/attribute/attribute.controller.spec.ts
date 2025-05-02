import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { AttributeEntity, AttributeType } from '../../model/attribute.entity';
import { Attribute4stringEntity } from '../../model/attribute4string.entity';
import { Attribute2flagEntity } from '../../model/attribute2flag.entity';
import { FlagEntity } from '../../model/flag.entity';
import { LangEntity } from '../../model/lang.entity';
import { DirectoryEntity } from '../../../registry/model/directory.entity';
import { AttributeAsPointEntity } from '../../model/attribute-as-point.entity';
import { BlockEntity } from '../../../content/model/block.entity';
import { AttributeAsElementEntity } from '../../model/attribute-as-element.entity';
import { AttributeAsSectionEntity } from '../../model/attribute-as-section.entity';
import { CollectionEntity } from '../../../storage/model/collection.entity';
import { AttributeAsFileEntity } from '../../model/attribute-as-file.entity';

describe('AttributeController', () => {
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

  describe('Attribute fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/attribute')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get list', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new AttributeEntity(), {id: `ATTR_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/attribute')
        .expect(200);

      expect(res.body).toHaveLength(10);
      expect(res.body[0].id).toBe('ATTR_0');
      expect(res.body[0].type).toBe('STRING');
      expect(res.body[9].id).toBe('ATTR_9');
      expect(res.body[9].type).toBe('STRING');
    });

    describe('Attribute fields with pagination', () => {
      test('Should get attribute with limit', async () => {
        for (let i = 0; i < 10; i++) {
          await Object.assign(new AttributeEntity(), {id: `NAME_${i}`}).save();
        }

        const res = await request(app.getHttpServer())
          .get('/attribute?limit=5')
          .expect(200);

        expect(res.body).toHaveLength(5);
        expect(res.body[0].id).toBe('NAME_0');
        expect(res.body[4].id).toBe('NAME_4');
      });

      test('Should get attribute with offset', async () => {
        for (let i = 0; i < 10; i++) {
          await Object.assign(new AttributeEntity(), {id: `NAME_${i}`}).save();
        }

        const res = await request(app.getHttpServer())
          .get('/attribute?offset=5')
          .expect(200);

        expect(res.body).toHaveLength(5);
        expect(res.body[0].id).toBe('NAME_5');
        expect(res.body[4].id).toBe('NAME_9');
      });
    });

    describe('Attribute fields with type', () => {
      test('Should get with registry type', async () => {
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const parent = await Object.assign(
          new AttributeEntity(),
          {id: 'NAME', type: AttributeType.POINT},
        ).save();
        await Object.assign(new AttributeAsPointEntity(), {directory, parent}).save();

        const res = await request(app.getHttpServer())
          .get('/attribute')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe('NAME');
        expect(res.body[0].type).toBe('POINT');
        expect(res.body[0].directory).toBe('CITY');
      });

      test('Should get with element type', async () => {
        const block = await Object.assign(new BlockEntity(), {}).save();
        const parent = await Object.assign(
          new AttributeEntity(),
          {id: 'NAME', type: AttributeType.ELEMENT},
        ).save();
        await Object.assign(new AttributeAsElementEntity(), {block, parent}).save();

        const res = await request(app.getHttpServer())
          .get('/attribute')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe('NAME');
        expect(res.body[0].type).toBe('ELEMENT');
        expect(res.body[0].block).toBe(1);
      });

      test('Should get with section type', async () => {
        const block = await Object.assign(new BlockEntity(), {}).save();
        const parent = await Object.assign(
          new AttributeEntity(),
          {id: 'NAME', type: AttributeType.SECTION},
        ).save();
        await Object.assign(new AttributeAsSectionEntity(), {block, parent}).save();

        const res = await request(app.getHttpServer())
          .get('/attribute')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe('NAME');
        expect(res.body[0].type).toBe('SECTION');
        expect(res.body[0].block).toBe(1);
      });

      test('Should get with file type', async () => {
        const collection = await Object.assign(new CollectionEntity(), {id: 'PREVIEW'}).save();
        const parent = await Object.assign(
          new AttributeEntity(),
          {id: 'NAME', type: AttributeType.FILE},
        ).save();
        await Object.assign(new AttributeAsFileEntity(), {collection, parent}).save();

        const res = await request(app.getHttpServer())
          .get('/attribute')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe('NAME');
        expect(res.body[0].type).toBe('FILE');
        expect(res.body[0].collection).toBe('PREVIEW');
      });
    });
  });

  describe('Attribute item', () => {
    test('Should get attribute instance', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .get('/attribute/NAME')
        .expect(200);

      expect(res.body.id).toBe('NAME');
    });

    test('Shouldn`t get with wrong id', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .get('/attribute/WRONG')
        .expect(404);
    });
  });

  describe('Attribute count', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/attribute/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get empty list', async () => {
      for (let i = 0; i < 10; i++) {
        await Object.assign(new AttributeEntity(), {id: `NAME_${i}`}).save();
      }

      const res = await request(app.getHttpServer())
        .get('/attribute/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Attribute with strings', () => {
    test('Should get attribute with strings', async () => {
      const parent = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Attribute4stringEntity(), {parent, attribute: parent, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/attribute')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('NAME');
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });

    test('Should get attribute with lang strings', async () => {
      const parent = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Attribute4stringEntity(), {parent, attribute: parent, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/attribute')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute[0].lang).toBe('EN');
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });
  });

  describe('Attribute with flags', () => {
    test('Should get attribute with flag', async () => {
      const parent = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Attribute2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/attribute')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });

  describe('Attribute addition', () => {
    describe('Attribute addition with fields', () => {
      test('Should add attribute', async () => {
        const item = await request(app.getHttpServer())
          .post('/attribute')
          .send({id: 'NAME'})
          .expect(201);

        expect(item.body.id).toBe('NAME');
        expect(item.body.type).toBe('STRING');
      });

      test('Should add with type', async () => {
        await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const item = await request(app.getHttpServer())
          .post('/attribute')
          .send({id: 'NAME', type: 'POINT', directory: 'CITY'})
          .expect(201);

        expect(item.body.id).toBe('NAME');
        expect(item.body.type).toBe('POINT');
      });

      test('Shouldn`t add with wrong type', async () => {
        await request(app.getHttpServer())
          .post('/attribute')
          .send({id: 'NAME', type: 'WRONG'})
          .expect(400);
      });

      test('Shouldn`t add with duplicate id', async () => {
        await request(app.getHttpServer())
          .post('/attribute')
          .send({id: 'NAME'})
          .expect(201);

        await request(app.getHttpServer())
          .post('/attribute')
          .send({id: 'NAME'})
          .expect(400);
      });

      test('Shouldn`t add with blank id', async () => {
        await request(app.getHttpServer())
          .post('/attribute')
          .send({id: ''})
          .expect(400);
      });
    });

    describe('Attribute addition with type', () => {
      test('Should add with registry type', async () => {
        await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

        const item = await request(app.getHttpServer())
          .post('/attribute')
          .send({
            id: 'SOME',
            type: 'POINT',
            directory: 'CITY',
          })
          .expect(201);

        expect(item.body.directory).toBe('CITY');
        expect(item.body.type).toBe('POINT');
      });

      test('Shouldn`t add with wrong registry', async () => {
        await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

        await request(app.getHttpServer())
          .post('/attribute')
          .send({
            id: 'SOME',
            type: 'POINT',
            directory: 'WRONG',
          })
          .expect(400);
      });

      test('Should add with element type', async () => {
        await Object.assign(new BlockEntity(), {}).save();

        const item = await request(app.getHttpServer())
          .post('/attribute')
          .send({
            id: 'SOME',
            type: 'ELEMENT',
            block: 1,
          })
          .expect(201);

        expect(item.body.block).toBe(1);
        expect(item.body.type).toBe('ELEMENT');
      });

      test('Shouldn`t add with wrong element block', async () => {
        await Object.assign(new BlockEntity(), {}).save();

        await request(app.getHttpServer())
          .post('/attribute')
          .send({
            id: 'SOME',
            type: 'ELEMENT',
            block: 777,
          })
          .expect(400);
      });

      test('Should add with section type', async () => {
        await Object.assign(new BlockEntity(), {}).save();

        const item = await request(app.getHttpServer())
          .post('/attribute')
          .send({
            id: 'SOME',
            type: 'SECTION',
            block: 1,
          })
          .expect(201);

        expect(item.body.block).toBe(1);
        expect(item.body.type).toBe('SECTION');
      });

      test('Shouldn`t add with wrong section block', async () => {
        await Object.assign(new BlockEntity(), {}).save();

        await request(app.getHttpServer())
          .post('/attribute')
          .send({
            id: 'SOME',
            type: 'SECTION',
            block: 777,
          })
          .expect(400);
      });

      test('Should add with file type', async () => {
        await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

        const item = await request(app.getHttpServer())
          .post('/attribute')
          .send({
            id: 'SOME',
            type: 'FILE',
            collection: 'DETAIL',
          })
          .expect(201);

        expect(item.body.collection).toBe('DETAIL');
        expect(item.body.type).toBe('FILE');
      });
    });

    describe('Attribute addition with strings', () => {
      test('Should add with strings', async () => {
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        const item = await request(app.getHttpServer())
          .post('/attribute')
          .send({
            id: 'SOME',
            attribute: [{attribute: 'NAME', string: 'VALUE'}],
          })
          .expect(201);

        expect(item.body.id).toBe('SOME');
        expect(item.body.attribute[0].attribute).toBe('NAME');
        expect(item.body.attribute[0].string).toBe('VALUE');
      });

      test('Shouldn`t add with wrong attribute', async () => {
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        await request(app.getHttpServer())
          .post('/attribute')
          .send({
            id: 'SOME',
            attribute: [{attribute: 'WRONG', string: 'VALUE'}],
          })
          .expect(400);
      });
    });

    describe('Attribute addition with flags', () => {
      test('Should add with flags', async () => {
        await Object.assign(new FlagEntity(), {id: 'PASSIVE'}).save();

        const item = await request(app.getHttpServer())
          .post('/attribute')
          .send({
            id: 'SOME',
            flag: ['PASSIVE'],
          })
          .expect(201);

        expect(item.body.flag).toEqual(['PASSIVE']);
      });

      test('Shouldn`t add with wrong flags', async () => {
        await Object.assign(new FlagEntity(), {id: 'PASSIVE'}).save();

        await request(app.getHttpServer())
          .post('/attribute')
          .send({
            id: 'SOME',
            flag: ['WRONG'],
          })
          .expect(400);
      });
    });
  });

  describe('Attribute update', () => {
    test('Should update attribute', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const item = await request(app.getHttpServer())
        .put('/attribute/NAME')
        .send({id: 'NAME'})
        .expect(200);

      expect(item.body.id).toBe('NAME');
    });

    test('Should update id', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const item = await request(app.getHttpServer())
        .put('/attribute/NAME')
        .send({id: 'UPDATE'})
        .expect(200);

      const count = await request(app.getHttpServer())
        .get('/attribute/count')
        .expect(200);

      expect(item.body.id).toBe('UPDATE');
      expect(count.body.count).toBe(1);
    });

    describe('Attribute update with type', () => {
      test('Should update type to point', async () => {
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'UPDATE', type: 'POINT', directory: 'CITY'})
          .expect(200);

        expect(item.body.type).toBe('POINT');
        expect(item.body.directory).toBe('CITY');
        expect(item.body.block).toBe(null);
        expect(item.body.collection).toBe(null);
      });

      test('Should update type from point to string', async () => {
        const parent = await Object.assign(new AttributeEntity(), {id: 'NAME', type: "POINT"}).save();
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        await Object.assign(new AttributeAsPointEntity(), {parent, directory}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'UPDATE', type: 'STRING'})
          .expect(200);

        expect(item.body.type).toBe('STRING');
        expect(item.body.directory).toBe(null);
        expect(item.body.block).toBe(null);
        expect(item.body.collection).toBe(null);
      });

      test('Should update type to element', async () => {
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const block = await Object.assign(new BlockEntity(), {}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'UPDATE', type: 'ELEMENT', block: block.id})
          .expect(200);

        expect(item.body.type).toBe('ELEMENT');
        expect(item.body.directory).toBe(null);
        expect(item.body.block).toBe(block.id);
        expect(item.body.collection).toBe(null);
      });

      test('Should update type from element to string', async () => {
        const parent = await Object.assign(new AttributeEntity(), {id: 'NAME', type: 'ELEMENT'}).save();
        const block = await Object.assign(new BlockEntity(), {}).save();
        await Object.assign(new AttributeAsElementEntity(), {parent, block}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'UPDATE', type: 'STRING'})
          .expect(200);

        expect(item.body.type).toBe('STRING');
        expect(item.body.directory).toBe(null);
        expect(item.body.block).toBe(null);
        expect(item.body.collection).toBe(null);
      });

      test('Should update type to section', async () => {
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const block = await Object.assign(new BlockEntity(), {}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'UPDATE', type: 'SECTION', block: block.id})
          .expect(200);

        expect(item.body.type).toBe('SECTION');
        expect(item.body.directory).toBe(null);
        expect(item.body.block).toBe(block.id);
        expect(item.body.collection).toBe(null);
      });

      test('Should update type from section to string', async () => {
        const parent = await Object.assign(new AttributeEntity(), {id: 'NAME', type: 'SECTION'}).save();
        const block = await Object.assign(new BlockEntity(), {}).save();
        await Object.assign(new AttributeAsSectionEntity(), {parent, block}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'UPDATE', type: 'STRING'})
          .expect(200);

        expect(item.body.type).toBe('STRING');
        expect(item.body.directory).toBe(null);
        expect(item.body.block).toBe(null);
        expect(item.body.collection).toBe(null);
      });

      test('Should update type to file', async () => {
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'UPDATE', type: 'FILE', collection: 'DETAIL'})
          .expect(200);

        expect(item.body.type).toBe('FILE');
        expect(item.body.directory).toBe(null);
        expect(item.body.block).toBe(null);
        expect(item.body.collection).toBe('DETAIL');
      });

      test('Should update type from file to string', async () => {
        const parent = await Object.assign(new AttributeEntity(), {id: 'NAME', type: 'FILE'}).save();
        const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
        await Object.assign(new AttributeAsFileEntity(), {parent, collection}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'UPDATE', type: 'STRING'})
          .expect(200);

        expect(item.body.type).toBe('STRING');
        expect(item.body.directory).toBe(null);
        expect(item.body.block).toBe(null);
        expect(item.body.collection).toBe(null);
      });
    });

    describe('Attribute update with strings', () => {
      test('Should update id with string', async () => {
        const parent = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new Attribute4stringEntity(), {parent, attribute: parent, string: 'VALUE'}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'UPDATE', attribute: [{string: 'VALUE', attribute: 'UPDATE'}]})
          .expect(200);
        const count = await request(app.getHttpServer())
          .get('/attribute/count')
          .expect(200);

        expect(item.body.id).toBe('UPDATE');
        expect(item.body.attribute).toEqual([{attribute: 'UPDATE', string: 'VALUE'}]);
        expect(count.body.count).toBe(1);
      });

      test('Should add strings', async () => {
        await Object.assign(new AttributeEntity(), {id: 'TARGET'}).save();
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/TARGET')
          .send({
            id: 'TARGET',
            attribute: [{attribute: 'NAME', string: 'VALUE'}],
          })
          .expect(200);

        expect(item.body.attribute[0].attribute).toBe('NAME');
        expect(item.body.attribute[0].string).toBe('VALUE');
      });
    });

    describe('Attribute update with flags', () => {
      test('Should add flag', async () => {
        await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'NAME', flag: ['FLAG']})
          .expect(200);

        expect(item.body.flag).toEqual(['FLAG']);
      });

      test('Should remove flag', async () => {
        const parent = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
        await Object.assign(new Attribute2flagEntity(), {parent, flag}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'NAME', flag: []})
          .expect(200);

        expect(item.body.flag).toEqual([]);
      });

      test('Should update flag', async () => {
        const parent = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
        await Object.assign(new FlagEntity(), {id: 'UPDATE'}).save();
        await Object.assign(new Attribute2flagEntity(), {parent, flag}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'NAME', flag: ['UPDATE']})
          .expect(200);

        expect(item.body.flag).toEqual(['UPDATE']);
      });

      test('Should update only flag', async () => {
        const parent = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
        await Object.assign(new FlagEntity(), {id: 'UPDATE'}).save();
        await Object.assign(new Attribute2flagEntity(), {parent, flag}).save();

        const item = await request(app.getHttpServer())
          .patch('/attribute/NAME')
          .send({flag: ['UPDATE']})
          .expect(200);

        expect(item.body.flag).toEqual(['UPDATE']);
      });

      test('Should update id with flag', async () => {
        const parent = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
        const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
        await Object.assign(new Attribute2flagEntity(), {parent, flag}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/NAME')
          .send({id: 'UPDATE', flag: ['FLAG']})
          .expect(200);

        const count = await request(app.getHttpServer())
          .get('/attribute/count')
          .expect(200);

        expect(item.body.id).toBe('UPDATE');
        expect(item.body.flag).toEqual(['FLAG']);
        expect(count.body.count).toBe(1);
      });

      test('Should add flags', async () => {
        await Object.assign(new AttributeEntity(), {id: 'TARGET'}).save();
        await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

        const item = await request(app.getHttpServer())
          .put('/attribute/TARGET')
          .send({
            id: 'TARGET',
            flag: ['ACTIVE'],
          })
          .expect(200);

        expect(item.body.flag).toEqual(['ACTIVE']);
      });
    });
  });

  describe('Attribute deletion', () => {
    test('Should delete attribute', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const item = await request(app.getHttpServer())
        .delete('/attribute/NAME')
        .expect(200);

      expect(item.body).toEqual(['NAME']);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const item = await request(app.getHttpServer())
        .delete('/attribute/WRONG')
        .expect(404);
    });
  });
});
