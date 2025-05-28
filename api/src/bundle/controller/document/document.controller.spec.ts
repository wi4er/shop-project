import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { DocumentEntity } from '../../model/document/document.entity';
import { Document4stringEntity } from '../../model/document/document4string.entity';
import { Document2flagEntity } from '../../model/document/document2flag.entity';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('DocumentController', () => {
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


  function createDocument(id?: string): Promise<AttributeEntity> & any {
    const item = new DocumentEntity();
    item.id = id;

    let method = AccessMethod.ALL;

    return Object.assign(Promise.resolve({
      then: (resolve: (entity: Promise<DocumentEntity>) => void) => resolve(
        source.getRepository(AccessEntity)
          .findOne({where: {method, target: AccessTarget.DOCUMENT}})
          .then(inst => {
            if (!inst && method) return Object.assign(new AccessEntity(), {
              method,
              target: AccessTarget.DOCUMENT,
            }).save();
          })
          .then(() => item.save()),
      ),
    }), {
      withAccess(updated: AccessMethod) {
        method = updated;

        return this;
      },
    });
  }

  describe('Document list', () => {
    test('Should get empty list', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      const res = await request(app.getHttpServer())
        .get('/bundle/document')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Shouldn`t get list without access', async () => {
      await request(app.getHttpServer())
        .get('/bundle/document')
        .expect(403);
    });

    test('Should get bundle with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await createDocument(`DOCUMENT_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/bundle/document?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('DOCUMENT_0');
      expect(res.body[1].id).toBe('DOCUMENT_1');
      expect(res.body[2].id).toBe('DOCUMENT_2');
    });

    test('Should get bundle with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await createDocument(`DOCUMENT_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/bundle/document?offset=9')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('DOCUMENT_9');
    });
  });

  describe('Document item', () => {
    test('Should get document item', async () => {
      await createDocument('DOCUMENT');

      const res = await request(app.getHttpServer())
        .get('/bundle/document/DOCUMENT')
        .expect(200);

      expect(res.body.id).toBe('DOCUMENT');
    });

    test('Shouldn`t get item without access', async () => {
      await createDocument('DOCUMENT').withAccess(null);

      await request(app.getHttpServer())
        .get('/bundle/document/DOCUMENT')
        .expect(403);
    });

    test('Shouldn`t get item with wrong id', async () => {
      await createDocument('DOCUMENT');

      await request(app.getHttpServer())
        .get('/bundle/document/WRONG')
        .expect(404);
    });
  });

  describe('Document count', () => {
    test('Should get empty count', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      const res = await request(app.getHttpServer())
        .get('/bundle/document/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get document count', async () => {
      for (let i = 0; i < 10; i++) {
        await createDocument(`DOCUMENT_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/bundle/document/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });

    test('Shouldn`t get without access', async () => {
      await request(app.getHttpServer())
        .get('/bundle/document/count')
        .expect(403);
    });
  });

  describe('Document with strings', () => {
    test('Should get flag with strings', async () => {
      const parent = await createDocument();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Document4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/bundle/document')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });

    test('Should get flag with lang strings', async () => {
      const parent = await createDocument();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Document4stringEntity(), {parent, attribute, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/bundle/document')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute[0].lang).toBe('EN');
      expect(res.body[0].attribute[0].string).toBe('VALUE');
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
    });
  });

  describe('Document with flags', () => {
    test('Should get flag with flag', async () => {
      const parent = await createDocument();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Document2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/bundle/document')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });

  describe('Document addition', () => {
    test('Should add item', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .post('/bundle/document')
        .send({})
        .expect(201);

      expect(inst.body.id).toHaveLength(36);
    });

    test('Should add with string', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .post('/bundle/document')
        .send({
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(201);

      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.DOCUMENT, method: AccessMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .post('/bundle/document')
        .send({
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('Document updating', () => {
    test('Should update bundle', async () => {
      await createDocument('DOCUMENT');

      const res = await request(app.getHttpServer())
        .put('/bundle/document/DOCUMENT')
        .send({id: 'DOCUMENT'})
        .expect(200);

      expect(res.body.id).toBe('DOCUMENT');
    });

    test('Shouldn`t update with wrong id', async () => {
      await createDocument('DOCUMENT');

      await request(app.getHttpServer())
        .put('/bundle/document/WRONG')
        .send({id: 1})
        .expect(404);
    });

    test('Shouldn`t update without access', async () => {
      await createDocument('DOCUMENT').withAccess(null);

      await request(app.getHttpServer())
        .put('/bundle/document/DOCUMENT')
        .send({id: 'DOCUMENT'})
        .expect(403);
    });

    test('Should update with string', async () => {
      await createDocument('DOCUMENT');
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .put('/bundle/document/DOCUMENT')
        .send({
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(200);

      expect(inst.body.id).toBe('DOCUMENT');
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Should update with flag', async () => {
      await createDocument('DOCUMENT');
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .put('/bundle/document/DOCUMENT')
        .send({flag: ['ACTIVE']})
        .expect(200);

      expect(inst.body.id).toBe('DOCUMENT');
      expect(inst.body.flag).toEqual(['ACTIVE']);
    });
  });
});
