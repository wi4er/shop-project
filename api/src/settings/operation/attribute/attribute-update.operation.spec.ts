import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AttributeEntity, AttributeType } from '../../model/attribute/attribute.entity';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import * as request from 'supertest';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { AttributeAsPointEntity } from '../../model/attribute/attribute-as-point.entity';
import { BlockEntity } from '../../../content/model/block/block.entity';
import { AttributeAsElementEntity } from '../../model/attribute/attribute-as-element.entity';
import { AttributeAsSectionEntity } from '../../model/attribute/attribute-as-section.entity';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { AttributeAsFileEntity } from '../../model/attribute/attribute-as-file.entity';
import { Attribute4stringEntity } from '../../model/attribute/attribute4string.entity';
import { FlagEntity } from '../../model/flag/flag.entity';
import { Attribute2flagEntity } from '../../model/attribute/attribute2flag.entity';

describe('Attribute update', () => {
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


  function createAttribute(id: string): Promise<AttributeEntity> & any {
    const item = new AttributeEntity();
    item.id = id;
    item.type = AttributeType.STRING;

    let method = AccessMethod.ALL;

    return Object.assign(Promise.resolve({
      then: resolve => resolve(
        source.getRepository(AccessEntity)
          .findOne({where: {method, target: AccessTarget.ATTRIBUTE}})
          .then(inst => {
            if (!inst && method) return Object.assign(new AccessEntity(), {
              method,
              target: AccessTarget.ATTRIBUTE,
            }).save();
          })
          .then(() => item.save()),
      ),
    }), {
      withAccess(updated: AccessMethod) {
        method = updated;

        return this;
      },
      withType(type: AttributeType) {
        item.type = type;

        return this;
      },
    });
  }

  describe('Attribute field update', () => {
    test('Should update attribute', async () => {
      await createAttribute('NAME')
        .withAccess(AccessMethod.PUT);

      const item = await request(app.getHttpServer())
        .put('/settings/attribute/NAME')
        .send({id: 'NAME', type: 'STRING'})
        .expect(200);

      expect(item.body.id).toBe('NAME');
    });

    test('Shouldn`t update without access', async () => {
      await createAttribute('NAME')
        .withAccess(null);

      await request(app.getHttpServer())
        .put('/settings/attribute/NAME')
        .send({id: 'NAME', type: 'STRING'})
        .expect(403);
    });

    test('Should update id', async () => {
      await createAttribute('NAME');

      const item = await request(app.getHttpServer())
        .put('/settings/attribute/NAME')
        .send({id: 'UPDATE', type: 'STRING'})
        .expect(200);

      const count = await request(app.getHttpServer())
        .get('/settings/attribute/count')
        .expect(200);

      expect(item.body.id).toBe('UPDATE');
      expect(count.body.count).toBe(1);
    });

    test('Shouldn`t update type', async () => {
      await createAttribute('NAME')
        .withAccess(AccessMethod.PUT);

      await request(app.getHttpServer())
        .put('/settings/attribute/NAME')
        .send({id: 'NAME', type: 'POINT'})
        .expect(400);
    });
  });

  describe('Attribute update with type', () => {
    describe('Attribute update with point type', () => {
      test('Should add attribute directory', async () => {
        await createAttribute('NAME').withType(AttributeType.POINT);
        await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

        const item = await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'UPDATE', type: 'POINT', directory: 'CITY'})
          .expect(200);

        expect(item.body.type).toBe('POINT');
        expect(item.body.directory).toBe('CITY');
        expect(item.body.block).toBe(null);
        expect(item.body.collection).toBe(null);
      });

      test('Should update attribute directory', async () => {
        const parent = await createAttribute('NAME').withType(AttributeType.POINT);
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        await Object.assign(new DirectoryEntity(), {id: 'UPDATE', type: AttributeType.POINT}).save();
        await Object.assign(new AttributeAsPointEntity(), {parent, directory}).save();

        const item = await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'NAME', type: 'POINT', directory: 'UPDATE'})
          .expect(200);

        expect(item.body.directory).toBe('UPDATE');
      });

      test('Shouldn`t update without directory', async () => {
        await createAttribute('NAME').withType(AttributeType.POINT);
        await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

        await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'UPDATE', type: 'POINT'})
          .expect(400);
      });

      test('Shouldn`t add wrong directory', async () => {
        await createAttribute('NAME').withType(AttributeType.POINT);
        await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

        await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'UPDATE', type: 'POINT', directory: 'WRONG'})
          .expect(400);
      });
    });

    describe('Attribute update with element type', () => {
      test('Should add attribute block', async () => {
        await createAttribute('NAME').withType(AttributeType.ELEMENT);
        const block = await Object.assign(new BlockEntity(), {id: 'BLOCK'}).save();

        const item = await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'UPDATE', type: 'ELEMENT', block: 'BLOCK'})
          .expect(200);

        expect(item.body.type).toBe('ELEMENT');
        expect(item.body.directory).toBe(null);
        expect(item.body.block).toBe(block.id);
        expect(item.body.collection).toBe(null);
      });

      test('Should update attribute block', async () => {
        const parent = await createAttribute('NAME').withType(AttributeType.ELEMENT);
        const block = await Object.assign(new BlockEntity(), {id: '111'}).save();
        await Object.assign(new AttributeAsElementEntity(), {parent, block}).save();
        await Object.assign(new BlockEntity(), {id: '222'}).save();

        const item = await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'UPDATE', type: 'ELEMENT', block: '222'})
          .expect(200);

        expect(item.body.block).toBe('222');
      });

      test('Shouldn`t update to element without block', async () => {
        await createAttribute('NAME');
        await Object.assign(new BlockEntity(), {}).save();

        await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'UPDATE', type: 'ELEMENT'})
          .expect(400);
      });

      test('Shouldn`t update to wrong block', async () => {
        const parent = await createAttribute('NAME').withType(AttributeType.ELEMENT);
        const block = await Object.assign(new BlockEntity(), {id: '111'}).save();
        await Object.assign(new AttributeAsElementEntity(), {parent, block}).save();
        await Object.assign(new BlockEntity(), {id: '222'}).save();

        await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'UPDATE', type: 'ELEMENT', block: 'WRONG'})
          .expect(400);
      });
    });

    describe('Attribute update with section type', () => {
      test('Should update type to section', async () => {
        await createAttribute('NAME').withType(AttributeType.SECTION);
        const block = await Object.assign(new BlockEntity(), {}).save();

        const item = await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'NAME', type: 'SECTION', block: block.id})
          .expect(200);

        expect(item.body.type).toBe('SECTION');
        expect(item.body.directory).toBe(null);
        expect(item.body.block).toBe(block.id);
        expect(item.body.collection).toBe(null);
      });

      test('Should update attribute block', async () => {
        const parent = await createAttribute('NAME').withType(AttributeType.SECTION);
        const block = await Object.assign(new BlockEntity(), {id: 'OLD'}).save();
        await Object.assign(new BlockEntity(), {id: 'NEW'}).save();
        await Object.assign(new AttributeAsSectionEntity(), {parent, block}).save();

        const item = await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'NAME', type: 'SECTION', block: 'NEW'})
          .expect(200);

        expect(item.body.block).toBe('NEW');
      });

      test('Shouldn`t update to section without block', async () => {
        await createAttribute('NAME').withType(AttributeType.SECTION);
        await Object.assign(new BlockEntity(), {}).save();

        await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'UPDATE', type: 'SECTION'})
          .expect(400);
      });

      test('Shouldn`t update with wrong block', async () => {
        await createAttribute('NAME').withType(AttributeType.SECTION);
        await Object.assign(new BlockEntity(), {}).save();

        await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'NAME', type: 'SECTION', block: 'WRONG'})
          .expect(400);
      });
    });

    describe('Attribute update with file type', () => {
      test('Should add attribute collection', async () => {
        await createAttribute('NAME').withType(AttributeType.FILE);
        await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

        const item = await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'UPDATE', type: 'FILE', collection: 'DETAIL'})
          .expect(200);

        expect(item.body.type).toBe('FILE');
        expect(item.body.directory).toBe(null);
        expect(item.body.block).toBe(null);
        expect(item.body.collection).toBe('DETAIL');
      });

      test('Should update type from file to string', async () => {
        const parent = await createAttribute('NAME').withType(AttributeType.FILE);
        const collection = await Object.assign(new CollectionEntity(), {id: 'OLD'}).save();
        await Object.assign(new CollectionEntity(), {id: 'NEW'}).save();
        await Object.assign(new AttributeAsFileEntity(), {parent, collection}).save();

        const item = await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'NAME', type: 'FILE', collection: 'NEW'})
          .expect(200);

        expect(item.body.type).toBe('FILE');
        expect(item.body.directory).toBe(null);
        expect(item.body.block).toBe(null);
        expect(item.body.collection).toBe('NEW');
      });

      test('Shouldn`t add with wrong collection', async () => {
        await createAttribute('NAME').withType(AttributeType.FILE);
        await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

        await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'UPDATE', type: 'FILE', collection: 'WRONG'})
          .expect(400);
      });

      test('Shouldn`t add without collection', async () => {
        await createAttribute('NAME').withType(AttributeType.FILE);
        await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

        await request(app.getHttpServer())
          .put('/settings/attribute/NAME')
          .send({id: 'UPDATE', type: 'FILE'})
          .expect(400);
      });
    });
  });

  describe('Attribute update with strings', () => {
    test('Should update id with string', async () => {
      const parent = await createAttribute('NAME');
      await Object.assign(new Attribute4stringEntity(), {parent, attribute: parent, string: 'VALUE'}).save();

      const item = await request(app.getHttpServer())
        .put('/settings/attribute/NAME')
        .send({id: 'UPDATE', type: 'STRING', attribute: [{string: 'VALUE', attribute: 'UPDATE'}]})
        .expect(200);
      const count = await request(app.getHttpServer())
        .get('/settings/attribute/count')
        .expect(200);

      expect(item.body.id).toBe('UPDATE');
      expect(item.body.attribute).toEqual([{attribute: 'UPDATE', string: 'VALUE'}]);
      expect(count.body.count).toBe(1);
    });

    test('Should add strings', async () => {
      await createAttribute('TARGET');
      await createAttribute('NAME');

      const item = await request(app.getHttpServer())
        .put('/settings/attribute/TARGET')
        .send({
          id: 'TARGET',
          type: 'STRING',
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(200);

      expect(item.body.attribute[0].attribute).toBe('NAME');
      expect(item.body.attribute[0].string).toBe('VALUE');
    });
  });

  describe('Attribute update with flags', () => {
    test('Should add flag', async () => {
      await createAttribute('NAME');
      await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();

      const item = await request(app.getHttpServer())
        .put('/settings/attribute/NAME')
        .send({id: 'NAME', type: 'STRING', flag: ['FLAG']})
        .expect(200);

      expect(item.body.flag).toEqual(['FLAG']);
    });

    test('Should remove flag', async () => {
      const parent = await createAttribute('NAME');
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Attribute2flagEntity(), {parent, flag}).save();

      const item = await request(app.getHttpServer())
        .put('/settings/attribute/NAME')
        .send({id: 'NAME', type: 'STRING', flag: []})
        .expect(200);

      expect(item.body.flag).toEqual([]);
    });

    test('Should update flag', async () => {
      const parent = await createAttribute('NAME');
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new FlagEntity(), {id: 'UPDATE'}).save();
      await Object.assign(new Attribute2flagEntity(), {parent, flag}).save();

      const item = await request(app.getHttpServer())
        .put('/settings/attribute/NAME')
        .send({id: 'NAME', type: 'STRING', flag: ['UPDATE']})
        .expect(200);

      expect(item.body.flag).toEqual(['UPDATE']);
    });

    test('Should update only flag', async () => {
      const parent = await createAttribute('NAME');
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new FlagEntity(), {id: 'UPDATE'}).save();
      await Object.assign(new Attribute2flagEntity(), {parent, flag}).save();

      const item = await request(app.getHttpServer())
        .patch('/settings/attribute/NAME')
        .send({flag: ['UPDATE']})
        .expect(200);

      expect(item.body.flag).toEqual(['UPDATE']);
    });

    test('Should update id with flag', async () => {
      const parent = await createAttribute('NAME');
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Attribute2flagEntity(), {parent, flag}).save();

      const item = await request(app.getHttpServer())
        .put('/settings/attribute/NAME')
        .send({id: 'UPDATE', type: 'STRING', flag: ['FLAG']})
        .expect(200);

      const count = await request(app.getHttpServer())
        .get('/settings/attribute/count')
        .expect(200);

      expect(item.body.id).toBe('UPDATE');
      expect(item.body.flag).toEqual(['FLAG']);
      expect(count.body.count).toBe(1);
    });

    test('Should add flags', async () => {
      await createAttribute('TARGET');
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const item = await request(app.getHttpServer())
        .put('/settings/attribute/TARGET')
        .send({
          id: 'TARGET',
          type: 'STRING',
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(item.body.flag).toEqual(['ACTIVE']);
    });
  });
});