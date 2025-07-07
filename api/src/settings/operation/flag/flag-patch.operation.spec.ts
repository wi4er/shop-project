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

describe('Flag patching', () => {
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

  describe('Flag field pathing', () => {
    test('Should update id only', async () => {
      await createFlag('OLD');

      const res = await request(app.getHttpServer())
        .patch('/settings/flag/OLD')
        .send({id: 'NEW'})
        .expect(200);

      expect(res.body.id).toBe('NEW');
    });

    test('Shouldn`t update id only without access', async () => {
      await createFlag('OLD').withAccess(null);

      await request(app.getHttpServer())
        .patch('/settings/flag/OLD')
        .send({id: 'NEW'})
        .expect(403);
    });
  });
});