import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { AttributeEntity, AttributeType } from '../../model/attribute/attribute.entity';
import { Attribute4stringEntity } from '../../model/attribute/attribute4string.entity';
import { Attribute2flagEntity } from '../../model/attribute/attribute2flag.entity';
import { FlagEntity } from '../../model/flag/flag.entity';
import { LangEntity } from '../../model/lang/lang.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { AttributeAsPointEntity } from '../../model/attribute/attribute-as-point.entity';
import { BlockEntity } from '../../../content/model/block/block.entity';
import { AttributeAsElementEntity } from '../../model/attribute/attribute-as-element.entity';
import { AttributeAsSectionEntity } from '../../model/attribute/attribute-as-section.entity';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { AttributeAsFileEntity } from '../../model/attribute/attribute-as-file.entity';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('Attribute Controller', () => {
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

  describe('Attribute fields', () => {
    describe('Attribute list', () => {
      test('Should get empty list', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.GET}).save();

        const res = await request(app.getHttpServer())
          .get('/settings/attribute')
          .expect(200);

        expect(res.body).toHaveLength(0);
      });

      test('Shouldn`t get list without access', async () => {
        await request(app.getHttpServer())
          .get('/settings/attribute')
          .expect(403);
      });

      test('Should get list', async () => {
        for (let i = 0; i < 10; i++) {
          await createAttribute(`ATTR_${i}`);
        }

        const res = await request(app.getHttpServer())
          .get('/settings/attribute')
          .expect(200);

        expect(res.body).toHaveLength(10);
        expect(res.body[0].id).toBe('ATTR_0');
        expect(res.body[0].type).toBe('STRING');
        expect(res.body[9].id).toBe('ATTR_9');
        expect(res.body[9].type).toBe('STRING');
      });
    });

    describe('AttributeEntity fields with pagination', () => {
      test('Should get attribute with limit', async () => {
        for (let i = 0; i < 10; i++) {
          await createAttribute(`NAME_${i}`);
        }

        const res = await request(app.getHttpServer())
          .get('/settings/attribute?limit=5')
          .expect(200);

        expect(res.body).toHaveLength(5);
        expect(res.body[0].id).toBe('NAME_0');
        expect(res.body[4].id).toBe('NAME_4');
      });

      test('Should get attribute with offset', async () => {
        for (let i = 0; i < 10; i++) {
          await createAttribute(`NAME_${i}`);
        }

        const res = await request(app.getHttpServer())
          .get('/settings/attribute?offset=5')
          .expect(200);

        expect(res.body).toHaveLength(5);
        expect(res.body[0].id).toBe('NAME_5');
        expect(res.body[4].id).toBe('NAME_9');
      });
    });

    describe('AttributeEntity fields with type', () => {
      test('Should get with registry type', async () => {
        const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
        const parent = await createAttribute('NAME').withType(AttributeType.POINT);
        await Object.assign(new AttributeAsPointEntity(), {directory, parent}).save();

        const res = await request(app.getHttpServer())
          .get('/settings/attribute')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe('NAME');
        expect(res.body[0].type).toBe('POINT');
        expect(res.body[0].directory).toBe('CITY');
      });

      test('Should get with element type', async () => {
        const block = await new BlockEntity('BLOCK').save();
        const parent = await createAttribute('NAME').withType(AttributeType.ELEMENT);
        await Object.assign(new AttributeAsElementEntity(), {block, parent}).save();

        const res = await request(app.getHttpServer())
          .get('/settings/attribute')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe('NAME');
        expect(res.body[0].type).toBe('ELEMENT');
        expect(res.body[0].block).toBe('BLOCK');
      });

      test('Should get with section type', async () => {
        const block = await new BlockEntity('BLOCK').save();
        const parent = await createAttribute('NAME').withType(AttributeType.SECTION);
        await Object.assign(new AttributeAsSectionEntity(), {block, parent}).save();

        const res = await request(app.getHttpServer())
          .get('/settings/attribute')
          .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe('NAME');
        expect(res.body[0].type).toBe('SECTION');
        expect(res.body[0].block).toBe('BLOCK');
      });

      test('Should get with file type', async () => {
        const collection = await Object.assign(new CollectionEntity(), {id: 'PREVIEW'}).save();
        const parent = await createAttribute('NAME').withType(AttributeType.FILE);
        await Object.assign(new AttributeAsFileEntity(), {collection, parent}).save();

        const res = await request(app.getHttpServer())
          .get('/settings/attribute')
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
      await createAttribute('NAME');

      const res = await request(app.getHttpServer())
        .get('/settings/attribute/NAME')
        .expect(200);

      expect(res.body.id).toBe('NAME');
    });

    test('Shouldn`t get without access', async () => {
      await createAttribute('NAME')
        .withType(AttributeType.STRING)
        .withAccess(null);

      await request(app.getHttpServer())
        .get('/settings/attribute/NAME')
        .expect(403);
    });

    test('Shouldn`t get with wrong id', async () => {
      await createAttribute('NAME');

      await request(app.getHttpServer())
        .get('/settings/attribute/WRONG')
        .expect(404);
    });
  });

  describe('Attribute count', () => {
    test('Should get zero count', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.GET}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/attribute/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Shouldn`t get count without access', async () => {
      await request(app.getHttpServer())
        .get('/settings/attribute/count')
        .expect(403);
    });

    test('Should get list count', async () => {
      for (let i = 0; i < 10; i++) {
        await createAttribute(`NAME_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/settings/attribute/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Attribute with strings', () => {
    test('Should get attribute with strings', async () => {
      const parent = await createAttribute(`NAME`);
      await Object.assign(new Attribute4stringEntity(), {parent, attribute: parent, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/attribute')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('NAME');
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });

    test('Should get attribute with lang strings', async () => {
      const parent = await createAttribute(`NAME`);
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Attribute4stringEntity(), {parent, attribute: parent, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/attribute')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute[0].lang).toBe('EN');
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });
  });

  describe('Attribute with flags', () => {
    test('Should get attribute with flag', async () => {
      const parent = await createAttribute(`NAME`);
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Attribute2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/settings/attribute')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });

    test('Should get attribute with multiple flags', async () => {
      const parent = await createAttribute(`NAME`);
      const flag1 = await Object.assign(new FlagEntity(), {id: 'FLAG_1'}).save();
      const flag2 = await Object.assign(new FlagEntity(), {id: 'FLAG_2'}).save();
      const flag3 = await Object.assign(new FlagEntity(), {id: 'FLAG_3'}).save();
      await Object.assign(new Attribute2flagEntity(), {parent, flag: flag1}).save();
      await Object.assign(new Attribute2flagEntity(), {parent, flag: flag2}).save();
      await Object.assign(new Attribute2flagEntity(), {parent, flag: flag3}).save();

      const list = await request(app.getHttpServer())
        .get('/settings/attribute')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG_1', 'FLAG_2', 'FLAG_3']);
    });
  });

});
