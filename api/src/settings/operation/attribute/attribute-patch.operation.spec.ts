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

describe('Attribute patch', () => {
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

  describe('Attribute patch with fields', () => {
    test('Should patch id only', async () => {
      await createAttribute('NAME')
        .withAccess(AccessMethod.PUT);

      const item = await request(app.getHttpServer())
        .patch('/settings/attribute/NAME')
        .send({id: 'UPDATE'})
        .expect(200);

      expect(item.body.id).toBe('UPDATE');
    });

    test('Shouldn`t patch without access', async () => {
      await createAttribute('NAME')
        .withAccess(null);

      await request(app.getHttpServer())
        .patch('/settings/attribute/NAME')
        .send({id: 'UPDATE'})
        .expect(403);
    });

    test('Shouldn`t patch with wrong id', async () => {
      await createAttribute('NAME')
        .withAccess(AccessMethod.PUT);

      await request(app.getHttpServer())
        .patch('/settings/attribute/WRONG')
        .send({id: 'UPDATE'})
        .expect(404);
    });
  });
});