import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { LangEntity } from '../../model/lang/lang.entity';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import * as request from 'supertest';

describe('Lang deletion', () => {
  let source: DataSource;
  let app: INestApplication;

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());
  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule({imports: [AppModule]}).compile();
    app = moduleBuilder.createNestApplication();
    await app.init();

    source = await createConnection(createConnectionOptions());
  });

  function createLang(id: string): Promise<LangEntity> & any {
    const item = new LangEntity();
    item.id = id;

    let method: AccessMethod = AccessMethod.ALL;

    return Object.assign(Promise.resolve({
      then: resolve => resolve(
        source.getRepository(AccessEntity)
          .findOne({where: {method, target: AccessTarget.LANG}})
          .then(inst => {
            if (!inst && method) return Object.assign(new AccessEntity(), {
              method,
              target: AccessTarget.LANG,
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

  describe('Lang item deletion', () => {
    test('Should delete lang', async () => {
      await createLang('EN');

      const res = await request(app.getHttpServer())
        .delete('/settings/lang/EN')
        .expect(200);

      expect(res.body).toEqual(['EN']);
    });

    test('Shouldn`t delete without access', async () => {
      await createLang('EN').withAccess(null);

      await request(app.getHttpServer())
        .delete('/settings/lang/EN')
        .expect(403);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await createLang('EN');

      await request(app.getHttpServer())
        .delete('/settings/lang/WRONG')
        .expect(404);
    });
  });
});