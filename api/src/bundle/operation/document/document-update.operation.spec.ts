import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import * as request from 'supertest';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { DocumentEntity } from '../../model/document/document.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { Document2flagEntity } from '../../model/document/document2flag.entity';
import { FieldEntity } from '../../../settings/model/field/field.entity';
import { Document2fieldEntity } from '../../model/document/document2field.entity';

describe('Document updating', () => {
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

  describe('Document updating with fields', () => {
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
  });

  describe('Document update with strings', () => {
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
  });

  describe('Document update with flags', () => {
    test('Should add with flag', async () => {
      await createDocument('DOCUMENT');
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .put('/bundle/document/DOCUMENT')
        .send({id: 'DOCUMENT', flag: ['ACTIVE']})
        .expect(200);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });

    test('Should remove flag', async () => {
      const parent = await createDocument('DOCUMENT');
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Document2flagEntity(), {parent, flag}).save();

      const inst = await request(app.getHttpServer())
        .put('/bundle/document/DOCUMENT')
        .send({id: 'DOCUMENT', flag: []})
        .expect(200);

      expect(inst.body.flag).toEqual([]);
    });
  });

  describe('Document update with fields', () => {
    test('Should add field', async () => {
      await createDocument('DOCUMENT');
      await Object.assign(new FieldEntity(), {id: 'DATA'}).save();

      const inst = await request(app.getHttpServer())
        .put('/bundle/document/DOCUMENT')
        .send({id: 'DOCUMENT', field: ['DATA']})
        .expect(200);

      expect(inst.body.field).toEqual(['DATA']);
    });

    test('Shouldn`t add duplicate field', async () => {
      await createDocument('DOCUMENT');
      await Object.assign(new FieldEntity(), {id: 'DATA'}).save();

      await request(app.getHttpServer())
        .put('/bundle/document/DOCUMENT')
        .send({id: 'DOCUMENT', field: ['DATA', 'DATA']})
        .expect(400);
    });

    test('Should update fields', async () => {
      const parent = await createDocument('DOCUMENT');
      const field = await Object.assign(new FieldEntity(), {id: 'DATA'}).save();
      await Object.assign(new Document2fieldEntity(), {parent, field}).save();

      const inst = await request(app.getHttpServer())
        .put('/bundle/document/DOCUMENT')
        .send({id: 'DOCUMENT', field: ['DATA']})
        .expect(200);

      expect(inst.body.field).toEqual(['DATA']);
    });

    test('Should remove field', async () => {
      const parent = await createDocument('DOCUMENT');
      const field = await Object.assign(new FieldEntity(), {id: 'DATA'}).save();
      await Object.assign(new Document2fieldEntity(), {parent, field}).save();

      const inst = await request(app.getHttpServer())
        .put('/bundle/document/DOCUMENT')
        .send({id: 'DOCUMENT', field: []})
        .expect(200);

      expect(inst.body.field).toEqual([]);
    });
  });
});