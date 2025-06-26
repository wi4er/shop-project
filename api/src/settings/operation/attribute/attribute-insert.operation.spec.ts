import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import * as request from 'supertest';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { BlockEntity } from '../../../content/model/block/block.entity';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { FlagEntity } from '../../model/flag/flag.entity';

describe('Attribute addition', () => {
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

  describe('Attribute addition with fields', () => {
    test('Should add attribute', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();

      const item = await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({id: 'NAME'})
        .expect(201);

      expect(item.body.id).toBe('NAME');
      expect(item.body.type).toBe('STRING');
    });

    test('Shouldn`t add without access', async () => {
      await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({id: 'NAME'})
        .expect(403);
    });

    test('Shouldn`t add without POST access', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.GET}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.PUT}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.DELETE}).save();

      await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({id: 'NAME'})
        .expect(403);
    });

    test('Should add with type', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      const item = await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({id: 'NAME', type: 'POINT', directory: 'CITY'})
        .expect(201);

      expect(item.body.id).toBe('NAME');
      expect(item.body.type).toBe('POINT');
    });

    test('Shouldn`t add with wrong type', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();

      await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({id: 'NAME', type: 'WRONG'})
        .expect(400);
    });

    test('Shouldn`t add with duplicate id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();

      await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({id: 'NAME'})
        .expect(201);

      await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({id: 'NAME'})
        .expect(400);
    });

    test('Shouldn`t add with blank id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();

      await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({id: ''})
        .expect(400);
    });
  });

  describe('Attribute addition with type', () => {
    describe('Attribute addition with point type', () => {
      test('Should add with point type', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

        const item = await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'POINT',
            directory: 'CITY',
          })
          .expect(201);

        expect(item.body.directory).toBe('CITY');
        expect(item.body.type).toBe('POINT');
      });

      test('Shouldn`t add with wrong directory', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

        await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'POINT',
            directory: 'WRONG',
          })
          .expect(400);
      });

      test('Shouldn`t add without directory', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

        await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'POINT',
          })
          .expect(400);
      });
    });

    describe('Attribute addition with element type', () => {
      test('Should add with element type', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await new BlockEntity('BLOCK').save();

        const item = await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'ELEMENT',
            block: 'BLOCK',
          })
          .expect(201);

        expect(item.body.block).toBe('BLOCK');
        expect(item.body.type).toBe('ELEMENT');
      });

      test('Shouldn`t add with wrong element block', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await new BlockEntity('BLOCK').save();

        await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'ELEMENT',
            block: 'WRONG',
          })
          .expect(400);
      });

      test('Shouldn`t add without element block', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await new BlockEntity('BLOCK').save();

        await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'ELEMENT',
          })
          .expect(400);
      });
    });

    describe('Attribute addition with section type', () => {
      test('Should add with section type', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await new BlockEntity('BLOCK').save();

        const item = await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'SECTION',
            block: 'BLOCK',
          })
          .expect(201);

        expect(item.body.block).toBe('BLOCK');
        expect(item.body.type).toBe('SECTION');
      });

      test('Shouldn`t add with wrong section block', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await new BlockEntity('BLOCK').save();

        await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'SECTION',
            block: 'WRONG',
          })
          .expect(400);
      });

      test('Shouldn`t add without section block', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await new BlockEntity('BLOCK').save();

        await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'SECTION',
          })
          .expect(400);
      });
    });

    describe('Attribute addition with file type', () => {
      test('Should add with file type', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

        const item = await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'FILE',
            collection: 'DETAIL',
          })
          .expect(201);

        expect(item.body.collection).toBe('DETAIL');
        expect(item.body.type).toBe('FILE');
      });

      test('Shouldn`t add with wrong collection', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

        await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'FILE',
            collection: 'WRONG',
          })
          .expect(400);
      });

      test('Shouldn`t add without collection', async () => {
        await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
        await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

        await request(app.getHttpServer())
          .post('/settings/attribute')
          .send({
            id: 'SOME',
            type: 'FILE',
          })
          .expect(400);
      });
    });
  });

  describe('Attribute addition with strings', () => {
    test('Should add with strings', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const item = await request(app.getHttpServer())
        .post('/settings/attribute')
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
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({
          id: 'SOME',
          attribute: [{attribute: 'WRONG', string: 'VALUE'}],
        })
        .expect(400);
    });
  });

  describe('Attribute addition with flags', () => {
    test('Should add with flags', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
      await Object.assign(new FlagEntity(), {id: 'PASSIVE'}).save();

      const item = await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({
          id: 'SOME',
          flag: ['PASSIVE'],
        })
        .expect(201);

      expect(item.body.flag).toEqual(['PASSIVE']);
    });

    test('Shouldn`t add duplicate flags', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
      await Object.assign(new FlagEntity(), {id: 'PASSIVE'}).save();

      await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({
          id: 'SOME',
          flag: ['PASSIVE', 'PASSIVE'],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong flags', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
      await Object.assign(new FlagEntity(), {id: 'PASSIVE'}).save();

      await request(app.getHttpServer())
        .post('/settings/attribute')
        .send({
          id: 'SOME',
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });
});