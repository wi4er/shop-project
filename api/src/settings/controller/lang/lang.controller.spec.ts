import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { LangEntity } from '../../model/lang/lang.entity';
import { Lang4stringEntity } from '../../model/lang/lang4string.entity';
import { Lang2flagEntity } from '../../model/lang/lang2flag.entity';
import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { FlagEntity } from '../../model/flag/flag.entity';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('Lang Controller', () => {
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

  describe('Lang list', () => {
    test('Should get empty list', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/lang')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Shouldn`t get list without access', async () => {
      await request(app.getHttpServer())
        .get('/settings/lang')
        .expect(403);
    });

    test('Should get lang with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await createLang(`LANG_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/settings/lang?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('LANG_9');
      expect(res.body[1].id).toBe('LANG_8');
      expect(res.body[2].id).toBe('LANG_7');
    });

    test('Should get lang with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await createLang(`LANG_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/settings/lang?offset=3')
        .expect(200);

      expect(res.body).toHaveLength(7);
      expect(res.body[0].id).toBe('LANG_6');
      expect(res.body[6].id).toBe('LANG_0');
    });
  });

  describe('Lang item', () => {
    test('Should get lang instance', async () => {
      await createLang('EN');

      const res = await request(app.getHttpServer())
        .get('/settings/lang/EN')
        .expect(200);

      expect(res.body.id).toBe('EN');
    });

    test('Shouldn`t get instance without access', async () => {
      await createLang('EN').withAccess(null);

      await request(app.getHttpServer())
        .get('/settings/lang/EN')
        .expect(403);
    });

    test('Shouldn`t get with wrong id', async () => {
      await createLang('EN');

      await request(app.getHttpServer())
        .get('/settings/lang/WONG')
        .expect(404);
    });
  });

  describe('Lang count', () => {
    test('Should count empty list', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.LANG, method: AccessMethod.ALL}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/lang/count')
        .expect(200);

      expect(res.body.count).toBe(0);
    });

    test('Shouldn`t count without access', async () => {
      await request(app.getHttpServer())
        .get('/settings/lang/count')
        .expect(403);
    });

    test('Should count lang list', async () => {
      for (let i = 0; i < 10; i++) {
        await createLang(`LANG_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/settings/lang/count')
        .expect(200);

      expect(res.body.count).toBe(10);
    });
  });

  describe('Lang with strings', () => {
    test('Should get lang with strings', async () => {
      const parent = await createLang('EN');
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Lang4stringEntity(), {parent, attribute, string: 'English'}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/lang')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('EN');
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('English');
    });

    test('Should get lang with lang strings', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang1 = await createLang('EN');
      const lang2 = await createLang('GR');
      await Object.assign(
        new Lang4stringEntity(),
        {parent: lang1, attribute, lang: lang1, string: 'English'},
      ).save();
      await Object.assign(
        new Lang4stringEntity(),
        {parent: lang1, attribute, lang: lang2, string: 'German'},
      ).save();

      const res = await request(app.getHttpServer())
        .get('/settings/lang/EN')
        .expect(200);

      expect(res.body.attribute[0].lang).toBe('EN');
      expect(res.body.attribute[0].string).toBe('English');
      expect(res.body.attribute[1].lang).toBe('GR');
      expect(res.body.attribute[1].string).toBe('German');
    });
  });

  describe('Lang with flags', () => {
    test('Should get lang with flag', async () => {
      const parent = await createLang('EN');
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Lang2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/settings/lang')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });
});
