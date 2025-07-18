import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { FormEntity } from '../../model/form/form.entity';
import * as request from 'supertest';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('Form patching', () => {
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

  describe('Form property patch ', () => {
    test('Should update form', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .patch('/feedback/form/ORDER')
        .send({id: 'ORDER'})
        .expect(200);

      expect(inst.body.id).toBe('ORDER');
    });
  });

  describe('Form version patch ', () => {
    test('Should patch form', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .patch('/feedback/form/ORDER')
        .send({})
        .expect(200);

      expect(inst.body.id).toBe('ORDER');
      expect(inst.body.version).toBe(2);
    });

    test('Should patch form id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .patch('/feedback/form/ORDER')
        .send({id: 'NEW'})
        .expect(200);

      expect(inst.body.id).toBe('NEW');
      expect(inst.body.version).toBe(2);
    });
  });

  describe('Form patch logging', () => {
    test('Should log id patch', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      await request(app.getHttpServer())
        .patch('/feedback/form/ORDER')
        .send({id: 'UPDATED'})
        .expect(200);

      const log = await request(app.getHttpServer())
        .get('/feedback/form-log/UPDATED')
        .expect(200)

      expect(log.body[0].version).toBe(2);
      expect(log.body[0].items).toEqual([{
        value: 'property.ID', from: 'ORDER', to: 'UPDATED',
      }]);
    });

    test('Should log flag patch', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .patch('/feedback/form/ORDER')
        .send({id: 'ORDER', flag: ['ACTIVE']})
        .expect(200);

      const log = await request(app.getHttpServer())
        .get('/feedback/form-log/ORDER')
        .expect(200)

      expect(log.body[0].version).toBe(2);
      expect(log.body[0].items).toEqual([{
        value: 'flag.ACTIVE', from: null, to: 'ACTIVE',
      }]);
    });
  });
});