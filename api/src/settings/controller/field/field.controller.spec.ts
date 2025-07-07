import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { FlagEntity } from '../../model/flag/flag.entity';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { FieldEntity } from '../../model/field/field.entity';
import * as request from 'supertest';
import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { LangEntity } from '../../model/lang/lang.entity';
import { Field4stringEntity } from '../../model/field/field4string.entity';
import { Field2flagEntity } from '../../model/field/field2flag.entity';

describe('Field Controller', () => {
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

  function createField(
    id: string,
    method: AccessMethod | null = AccessMethod.ALL,
  ): Promise<FlagEntity> & any {
    const item = new FieldEntity();
    item.id = id;

    return Object.assign(Promise.resolve({
      then: resolve => resolve(
        source.getRepository(AccessEntity)
          .findOne({where: {method, target: AccessTarget.FIELD}})
          .then(inst => {
            if (!inst && method) return Object.assign(new AccessEntity(), {
              method,
              target: AccessTarget.FIELD,
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

  describe('Field list', () => {
    test('Should get empty list', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FIELD, method: AccessMethod.ALL}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/field')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Shouldn`t get without access', async () => {
      await request(app.getHttpServer())
        .get('/settings/field')
        .expect(403);
    });

    test('Should get list', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FIELD, method: AccessMethod.ALL}).save();

      for (let i = 0; i < 10; i++) {
        await createField(`field_${i}`);
      }
      const res = await request(app.getHttpServer())
        .get('/settings/field')
        .expect(200);

      expect(res.body).toHaveLength(10);
    });

    test('Should get flag with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await createField(`field_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/settings/field?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe('field_0');
      expect(res.body[1].id).toBe('field_1');
      expect(res.body[2].id).toBe('field_2');
    });

    test('Should get flag with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await createField(`field_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/settings/field?offset=9')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('field_9');
    });
  });

  describe('Field item', () => {
    test('Should get field item', async () => {
      await createField('DATA');

      const res = await request(app.getHttpServer())
        .get('/settings/field/DATA')
        .expect(200);

      expect(res.body.id).toBe('DATA');
    });

    test('Shouldn`t get instance without access', async () => {
      await createField('DATA')
        .withAccess(null);

      await request(app.getHttpServer())
        .get('/settings/field/DATA')
        .expect(403);
    });

    test('Shouldn`t get with wrong id', async () => {
      await createField('DATA');

      await request(app.getHttpServer())
        .get('/settings/field/WRONG')
        .expect(404);
    });
  });

  describe('Field count', () => {
    test('Should get empty count', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FIELD, method: AccessMethod.ALL}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/field/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get count without access', async () => {
      await request(app.getHttpServer())
        .get('/settings/field/count')
        .expect(403);
    });

    test('Should get flag count', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FIELD, method: AccessMethod.ALL}).save();
      for (let i = 0; i < 10; i++) {
        await createField(`field_${i}`);
      }

      const res = await request(app.getHttpServer())
        .get('/settings/field/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Field with strings', () => {
    test('Should get flag with strings', async () => {
      const parent = await createField('DATA');
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Field4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/field')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('DATA');
      expect(res.body[0].attribute).toEqual([{attribute: 'NAME',string: 'VALUE' }]);
    });

    test('Should get flag with lang strings', async () => {
      const parent = await createField('DATA');
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Field4stringEntity(), {parent, attribute, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/settings/field')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].attribute[0].lang).toBe('EN');
      expect(res.body[0].attribute[0].string).toBe('VALUE');
    });
  });

  describe('Field with flags', () => {
    test('Should get flag with flag', async () => {
      const parent = await createField('ACTIVE');
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Field2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/settings/field')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });

    test('Should get flag with multi flags', async () => {
      const parent = await createField('ACTIVE');
      for (let i = 1; i < 4; i++) {
        const flag = await Object.assign(new FlagEntity(), {id: `FLAG_${i}`}).save();
        await Object.assign(new Field2flagEntity(), {parent, flag}).save();
      }

      const list = await request(app.getHttpServer())
        .get('/settings/field')
        .expect(200);

      expect(list.body[0].flag).toEqual(['FLAG_1', 'FLAG_2', 'FLAG_3']);
    });
  });
});

