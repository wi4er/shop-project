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

  describe('Flag addition with fields', () => {
    test('Should add item', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .post('/settings/flag')
        .send({id: 'NEW'})
        .expect(201);

      expect(inst.body.id).toBe('NEW');
    });

    test('Shouldn`t add without access', async () => {
      await request(app.getHttpServer())
        .post('/settings/flag')
        .send({id: 'NEW'})
        .expect(403);
    });

    test('Shouldn`t add without POST access', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.GET}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.PUT}).save();
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.DELETE}).save();

      await request(app.getHttpServer())
        .post('/settings/flag')
        .send({id: 'NEW'})
        .expect(403);
    });

    test('Should add with fields', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .post('/settings/flag')
        .send({
          id: 'NEW',
          color: '0F0',
          icon: 'folder',
          iconSvg: 'SOME',
        })
        .expect(201);

      expect(inst.body.id).toBe('NEW');
      expect(inst.body.color).toBe('0F0');
      expect(inst.body.icon).toBe('folder');
      expect(inst.body.iconSvg).toBe('SOME');
    });

    test('Shouldn`t add with blank id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/settings/flag')
        .send({id: ''})
        .expect(400);
    });

    test('Shouldn`t add without id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/settings/flag')
        .send({})
        .expect(400);
    });

    test('Shouldn`t duplicate item', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.ALL}).save();

      await request(app.getHttpServer())
        .post('/settings/flag')
        .send({id: 'NEW'})
        .expect(201);

      await request(app.getHttpServer())
        .post('/settings/flag')
        .send({id: 'NEW'})
        .expect(400);
    });
  });

  describe('Flag addition with strings', () => {
    test('Should add with string', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.ALL}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/settings/flag')
        .send({
          id: 'NEW',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(201);

      expect(inst.body.id).toBe('NEW');
      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Shouldn`r add with wrong attribute', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FLAG, method: AccessMethod.ALL}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .post('/settings/flag')
        .send({
          id: 'NEW',
          attribute: [
            {attribute: 'WRONG', string: 'VALUE'},
          ],
        })
        .expect(400);
    });
  });

  describe('Flag addition with flag', () => {
    test('Should add with flag', async () => {
      await createFlag('ACTIVE');

      const inst = await request(app.getHttpServer())
        .post('/settings/flag')
        .send({
          id: 'NEW',
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.id).toBe('NEW');
      expect(inst.body.flag).toEqual(['ACTIVE']);
    });

    test('Shouldn`t add with duplicate flag', async () => {
      await createFlag('ACTIVE');

      await request(app.getHttpServer())
        .post('/settings/flag')
        .send({
          id: 'NEW',
          flag: ['ACTIVE', 'ACTIVE'],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong flag', async () => {
      await createFlag('ACTIVE');

      await request(app.getHttpServer())
        .post('/settings/flag')
        .send({
          id: 'NEW',
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });
});