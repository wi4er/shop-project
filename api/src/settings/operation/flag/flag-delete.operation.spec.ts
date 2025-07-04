import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { FlagEntity } from '../../model/flag/flag.entity';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import * as request from 'supertest';

describe('Flag addition', () => {
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

  function createFlag(
    id: string,
    method: AccessMethod | null = AccessMethod.ALL,
  ): Promise<FlagEntity> & any {
    const item = new FlagEntity();
    item.id = id;

    return Object.assign(Promise.resolve({
      then: resolve => resolve(
        source.getRepository(AccessEntity)
          .findOne({where: {method, target: AccessTarget.FLAG}})
          .then(inst => {
            if (!inst && method) return Object.assign(new AccessEntity(), {
              method,
              target: AccessTarget.FLAG,
            }).save();
          })
          .then(() => item.save()),
      ),
    }), {
      withAccess(updated: AccessMethod) {
        method = updated;
        return this;
      },
      withColor(color: string) {
        item.color = color;
        return this;
      },
      withIcon(icon: string) {
        item.icon = icon;
        return this;
      },
    });
  }

  describe('Flag item deletion', () => {
    test('Should delete', async () => {
      await createFlag('ACTIVE');

      const inst = await request(app.getHttpServer())
        .delete('/settings/flag/ACTIVE')
        .expect(200);

      expect(inst.body).toEqual(['ACTIVE']);
    });

    test('Shouldn`t delete without access', async () => {
      await createFlag('ACTIVE').withAccess(null);

      await request(app.getHttpServer())
        .delete('/settings/flag/ACTIVE')
        .expect(403);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await createFlag('ACTIVE');

      await request(app.getHttpServer())
        .delete('/settings/flag/WRONG')
        .expect(404);
    });
  });
});