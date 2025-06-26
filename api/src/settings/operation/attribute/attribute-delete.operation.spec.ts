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

  describe('Attribute deletion', () => {
    test('Should delete attribute', async () => {
      await createAttribute('NAME');

      const item = await request(app.getHttpServer())
        .delete('/attribute/NAME')
        .expect(200);

      expect(item.body).toEqual(['NAME']);
    });

    test('Shouldn`t delete without access', async () => {
      await createAttribute('NAME')
        .withAccess(null);

      await request(app.getHttpServer())
        .delete('/attribute/NAME')
        .expect(403);
    });

    test('Shouldn`t delete without DELETE access', async () => {
      // await createAttribute('NAME')
      //   .withAccess(AccessMethod.GET)
      //   .withAccess(AccessMethod.POST)
      //   .withAccess(AccessMethod.PUT);
      // // await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      // // await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.GET}).save();
      // // await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.POST}).save();
      // // await Object.assign(new AccessEntity(), {target: AccessTarget.ATTRIBUTE, method: AccessMethod.PUT}).save();
      //
      // await request(app.getHttpServer())
      //   .delete('/attribute/NAME')
      //   .expect(403);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await createAttribute('NAME');

      await request(app.getHttpServer())
        .delete('/attribute/WRONG')
        .expect(404);
    });
  });
});