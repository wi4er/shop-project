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
import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { Flag4stringEntity } from '../../model/flag/flag4string.entity';
import { Flag2flagEntity } from '../../model/flag/flag2flag.entity';

describe('Flag updating', () => {
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

  describe('Flag updating with fields', () => {
    test('Should update flag', async () => {
      await createFlag('NEW');

      const res = await request(app.getHttpServer())
        .put('/settings/flag/NEW')
        .send({id: 'NEW'})
        .expect(200);

      expect(res.body.id).toBe('NEW');
    });

    test('Shouldn`t update flag without access', async () => {
      await createFlag('NEW')
        .withAccess(null);

      await request(app.getHttpServer())
        .put('/settings/flag/NEW')
        .send({id: 'NEW'})
        .expect(403);
    });

    test('Should add fields', async () => {
      await createFlag('NEW');

      const res = await request(app.getHttpServer())
        .put('/settings/flag/NEW')
        .send({
          id: 'NEW',
          color: 'FFF',
          icon: 'folder',
          iconSvg: 'SOME',
        })
        .expect(200);

      expect(res.body.id).toBe('NEW');
      expect(res.body.color).toBe('FFF');
      expect(res.body.icon).toBe('folder');
      expect(res.body.iconSvg).toBe('SOME');
    });

    test('Should update id only', async () => {
      await createFlag('OLD');

      const res = await request(app.getHttpServer())
        .patch('/settings/flag/OLD')
        .send({id: 'NEW'})
        .expect(200);

      expect(res.body.id).toBe('NEW');
    });

    test('Shouldn`t update id only without access', async () => {
      await createFlag('OLD');

      const res = await request(app.getHttpServer())
        .patch('/settings/flag/OLD')
        .send({id: 'NEW'})
        .expect(200);

      expect(res.body.id).toBe('NEW');
    });

    test('Should change id', async () => {
      await createFlag('OLD');

      const res = await request(app.getHttpServer())
        .put('/settings/flag/OLD')
        .send({id: 'UPDATED'})
        .expect(200);

      const count = await request(app.getHttpServer())
        .get('/settings/flag/count')
        .expect(200);

      expect(res.body.id).toBe('UPDATED');
      expect(count.body.count).toBe(1);
    });
  });

  describe('Flag updating with strings', () => {
    test('Should change id with string', async () => {
      const parent = await createFlag('OLD');
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Flag4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .put('/settings/flag/OLD')
        .send({id: 'UPDATED', attribute: [{attribute: 'NAME', string: 'VALUE'}]})
        .expect(200);

      const count = await request(app.getHttpServer())
        .get('/settings/flag/count')
        .expect(200);

      expect(res.body.id).toBe('UPDATED');
      expect(res.body.attribute).toEqual([{attribute: 'NAME', string: 'VALUE'}]);
      expect(count.body.count).toBe(1);
    });

    test('Should add string', async () => {
      await createFlag('NEW');
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const res = await request(app.getHttpServer())
        .put('/settings/flag/NEW')
        .send({
          id: 'NEW',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(200);

      expect(res.body.attribute).toHaveLength(1);
      expect(res.body.attribute[0].attribute).toBe('NAME');
      expect(res.body.attribute[0].string).toBe('VALUE');
    });
  });

  describe('Flag update with flag', () => {
    test('Should change id with flag', async () => {
      const parent = await createFlag('OLD');
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Flag2flagEntity(), {parent, flag}).save();

      const res = await request(app.getHttpServer())
        .put('/settings/flag/OLD')
        .send({id: 'UPDATED', flag: ['FLAG']})
        .expect(200);

      const count = await request(app.getHttpServer())
        .get('/settings/flag/count')
        .expect(200);

      expect(res.body.id).toBe('UPDATED');
      expect(res.body.flag).toEqual(['FLAG']);
      expect(count.body.count).toBe(2);
    });

    test('Should add flag', async () => {
      await createFlag('NEW');
      await createFlag('ACTIVE');

      const res = await request(app.getHttpServer())
        .put('/settings/flag/NEW')
        .send({
          id: 'NEW',
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(res.body.flag).toEqual(['ACTIVE']);
    });

    test('Shouldn`t add with duplicate flag', async () => {
      await createFlag('NEW');
      await createFlag('ACTIVE');

      await request(app.getHttpServer())
        .put('/settings/flag/NEW')
        .send({
          id: 'NEW',
          flag: ['ACTIVE', 'ACTIVE'],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong flag', async () => {
      await createFlag('NEW');
      await createFlag('ACTIVE');

      await request(app.getHttpServer())
        .put('/settings/flag/NEW')
        .send({
          id: 'NEW',
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });
});
