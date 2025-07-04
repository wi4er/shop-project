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
import { Lang4stringEntity } from '../../model/lang/lang4string.entity';
import { FlagEntity } from '../../model/flag/flag.entity';
import { Lang2flagEntity } from '../../model/lang/lang2flag.entity';

describe('Lang updating', () => {
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

  describe('Lang update with fields', () => {
    test('Should update item', async () => {
      await createLang('EN');

      const res = await request(app.getHttpServer())
        .put('/settings/lang/EN')
        .send({id: 'EN'})
        .expect(200);

      expect(res.body.id).toBe('EN');
    });

    test('Shouldn`t update without access', async () => {
      await createLang('EN').withAccess(null);

      await request(app.getHttpServer())
        .put('/settings/lang/EN')
        .send({id: 'EN'})
        .expect(403);
    });

    test('Should update id', async () => {
      await createLang('EN');

      const res = await request(app.getHttpServer())
        .put('/settings/lang/EN')
        .send({id: 'GR'})
        .expect(200);

      expect(res.body.id).toBe('GR');
    });

    test('Should update only id', async () => {
      await createLang('EN');

      const res = await request(app.getHttpServer())
        .patch('/settings/lang/EN')
        .send({id: 'GR'})
        .expect(200);

      expect(res.body.id).toBe('GR');
    });
  });

  describe('Lang update with strings', () => {
    test('Should update id with string', async () => {
      const parent = await createLang('EN');
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Lang4stringEntity(), {parent, attribute, string: 'English'}).save();

      const res = await request(app.getHttpServer())
        .put('/settings/lang/EN')
        .send({id: 'GR', attribute: [{attribute: 'NAME', string: 'English'}]})
        .expect(200);

      expect(res.body.id).toBe('GR');
      expect(res.body.attribute).toEqual([{attribute: 'NAME', string: 'English'}]);
    });
  });

  describe('Lang update with flags', () => {
    test('Should update id with flag', async () => {
      const parent = await createLang('EN');
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Lang2flagEntity(), {parent, flag}).save();

      const res = await request(app.getHttpServer())
        .put('/settings/lang/EN')
        .send({id: 'GR', flag: ['FLAG']})
        .expect(200);

      expect(res.body.id).toBe('GR');
      expect(res.body.flag).toEqual(['FLAG']);
    });

    test('Should add flag', async () => {
      await createLang('EN');
      await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();

      const res = await request(app.getHttpServer())
        .put('/settings/lang/EN')
        .send({id: 'EN', flag: ['FLAG']})
        .expect(200);

      expect(res.body.flag).toEqual(['FLAG']);
    });

    test('Shouldn`t add duplicate flag', async () => {
      await createLang('EN');
      await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();

      await request(app.getHttpServer())
        .put('/settings/lang/EN')
        .send({id: 'EN', flag: ['FLAG', 'FLAG']})
        .expect(400);
    });

    test('Shouldn`t update wrong flag', async () => {
      const parent = await createLang('EN');
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Lang2flagEntity(), {parent, flag}).save();

      await request(app.getHttpServer())
        .put('/settings/lang/EN')
        .send({id: 'GR', flag: ['WRONG']})
        .expect(400);
    });

    test('Should update only flag', async () => {
      const parent = await createLang('EN');
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Lang2flagEntity(), {parent, flag}).save();

      const res = await request(app.getHttpServer())
        .patch('/settings/lang/EN')
        .send({flag: ['FLAG']})
        .expect(200);

      expect(res.body.id).toBe('EN');
      expect(res.body.flag).toEqual(['FLAG']);
    });
  });
});