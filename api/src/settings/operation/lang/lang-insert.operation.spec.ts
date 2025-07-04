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
import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { FlagEntity } from '../../model/flag/flag.entity';

describe('Lang addition', () => {
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

  describe('Lang addition with fields', () => {
    test('Should add item', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      const res = await request(app.getHttpServer())
        .post('/settings/lang')
        .send({id: 'EN'})
        .expect(201);

      expect(res.body.id).toBe('EN');
    });

    test('Shouldn`t add without access', async () => {
      await request(app.getHttpServer())
        .post('/settings/lang')
        .send({id: 'EN'})
        .expect(403);
    });

    test('Shouldn`t add without id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/settings/lang')
        .send({})
        .expect(400);
    });

    test('Shouldn`t add with blank id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/settings/lang')
        .send({id: ''})
        .expect(400);
    });

    test('Shouldn`t add with duplicate id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/settings/lang')
        .send({id: 'EN'})
        .expect(201);

      await request(app.getHttpServer())
        .post('/settings/lang')
        .send({id: 'EN'})
        .expect(400);
    });
  });

  describe('Lang addition with strings', () => {
    test('Should add with strings', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      const res = await request(app.getHttpServer())
        .post('/settings/lang')
        .send({
          id: 'EN',
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(201);

      expect(res.body.id).toBe('EN');
      expect(res.body.attribute[0].attribute).toBe('NAME');
      expect(res.body.attribute[0].string).toBe('VALUE');
    });

    test('Shouldn`t add without attribute', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/settings/lang')
        .send({
          id: 'EN',
          attribute: [{string: 'VALUE'}],
        })
        .expect(400);
    });

    test('Shouldn`t add without strings', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/settings/lang')
        .send({
          id: 'EN',
          attribute: [{attribute: 'NAME', string: null}],
        })
        .expect(400);
    });
  });

  describe('Lang addition with flag', () => {
    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      const res = await request(app.getHttpServer())
        .post('/settings/lang')
        .send({
          id: 'EN',
          flag: ['NEW'],
        })
        .expect(201);

      expect(res.body.flag).toEqual(['NEW']);
    });

    test('Shouldn`t add with duplicate flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/settings/lang')
        .send({
          id: 'EN',
          flag: ['NEW', 'NEW'],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/settings/lang')
        .send({
          id: 'EN',
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });
});