import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FlagEntity } from '../../model/flag/flag.entity';
import { Flag4stringEntity } from '../../model/flag/flag4string.entity';
import { Flag2flagEntity } from '../../model/flag/flag2flag.entity';
import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { LangEntity } from '../../model/lang/lang.entity';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';

describe('Flag Controller', () => {
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

  describe('Flag list', () => {
    test('Should get empty list', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.ALL}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/flag')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Shouldn`t get without access', async () => {
      await request(app.getHttpServer())
        .get('/settings/flag')
        .expect(403);
    });

    test('Should get flag with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await createFlag(`flag_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/settings/flag?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('flag_0');
      expect(res.body[1].id).toBe('flag_1');
      expect(res.body[2].id).toBe('flag_2');
    });

    test('Should get flag with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await createFlag(`flag_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/settings/flag?offset=9')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('flag_9');
    });
  });

  describe('Flag item', () => {
    test('Should get flag instance', async () => {
      await createFlag('ACTIVE')
        .withColor('FFF')
        .withIcon('folder');

      const res = await request(app.getHttpServer())
        .get('/settings/flag/ACTIVE')
        .expect(200);

      expect(res.body.id).toBe('ACTIVE');
      expect(res.body.color).toBe('FFF');
      expect(res.body.icon).toBe('folder');
    });

    test('Shouldn`t get instance without access', async () => {
      await createFlag('ACTIVE')
        .withAccess(null);

      await request(app.getHttpServer())
        .get('/settings/flag/ACTIVE')
        .expect(403);
    });

    test('Shouldn`t get with wrong id', async () => {
      await createFlag('ACTIVE');

      await request(app.getHttpServer())
        .get('/settings/flag/WRONG')
        .expect(404);
    });
  });

  describe('Flag count', () => {
    test('Should get empty count', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.ALL}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/flag/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get count without access', async () => {
      await request(app.getHttpServer())
        .get('/settings/flag/count')
        .expect(403);
    });

    test('Should get flag count', async () => {
      for (let i = 0; i < 10; i++) {
        await createFlag(`flag_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/settings/flag/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Flag with strings', () => {
    test('Should get flag with strings', async () => {
      const parent = await createFlag('ACTIVE');
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Flag4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/flag')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('ACTIVE');
      expect(res.body[0].attribute).toHaveLength(1);
      expect(res.body[0].attribute[0].attribute).toBe('NAME');
      expect(res.body[0].attribute[0].lang).toBeUndefined();
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });

    test('Should get flag with lang strings', async () => {
      const parent = await createFlag('ACTIVE');
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Flag4stringEntity(), {parent, attribute, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/flag')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute[0].lang).toBe('EN');
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });
  });

  describe('Flag with flags', () => {
    test('Should get flag with flag', async () => {
      const parent = await createFlag('ACTIVE');
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Flag2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/settings/flag')
        .expect(200);

      expect(list.body).toHaveLength(2);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });

    test('Should get flag with multi flags', async () => {
      const parent = await createFlag('ACTIVE');
      for (let i = 1; i < 4; i++) {
        const flag = await Object.assign(new FlagEntity(), {id: `FLAG_${i}`}).save();
        await Object.assign(new Flag2flagEntity(), {parent, flag}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/settings/flag')
        .expect(200);

      expect(list.body[0].flag).toEqual(['FLAG_1', 'FLAG_2', 'FLAG_3']);
    });
  });
});
