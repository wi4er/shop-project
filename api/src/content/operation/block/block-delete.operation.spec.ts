import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { BlockEntity } from '../../model/block/block.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { Block2permissionEntity } from '../../model/block/block2permission.entity';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';

describe('Block deletion', () => {
  let source: DataSource;
  let app: INestApplication;

  function createBlock(id?: string): Promise<BlockEntity> & any {
    const item = new BlockEntity();
    item.id = id;

    let permission = null;
    let access = null;

    const operations = {
      withSort(sort: number) {
        item.sort = sort;
        return this;
      },
      withVersion(version: number) {
        item.version = version;
        return this;
      },
      withPermission(
        method: PermissionMethod | null = PermissionMethod.ALL,
        group: string | null = null,
      ) {
        if (!permission) permission = [];
        if (method) permission.push({group, method});
        return this;
      },
      withAccess(
        method: AccessMethod = AccessMethod.ALL,
        group?: GroupEntity,
      ) {
        if (!access) access = [];
        if (method) access.push({method, group});
        return this;
      },
    };

    return Object.assign(Promise.resolve({
      then: resolve => resolve(item.save().then(async parent => {
        for (const {group, method} of permission ?? [{group: null, method: PermissionMethod.ALL}]) {
          await Object.assign(
            new Block2permissionEntity(),
            {parent, group, method},
          ).save();
        }

        for (const {group, method} of access ?? [{group: null, method: AccessMethod.ALL}]) {
          await source.getRepository(AccessEntity)
            .findOne({where: {group, method, target: AccessTarget.BLOCK}})
            .then(inst => {
              if (!inst) return Object.assign(new AccessEntity(), {
                group,
                method,
                target: AccessTarget.BLOCK,
              }).save();
            });
        }

        return parent;
      })),
    }), operations);
  }

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule({imports: [AppModule]}).compile();
    app = moduleBuilder.createNestApplication();
    await app.init();

    source = await createConnection(createConnectionOptions());
  });
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Content block item deletion', () => {
    test('Should delete block', async () => {
      const parent = await createBlock();

      const inst = await request(app.getHttpServer())
        .delete(`/content/block/${parent.id}`)
        .expect(200);

      expect(inst.body).toEqual([parent.id]);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await createBlock();

      await request(app.getHttpServer())
        .delete(`/content/block/WRONG`)
        .expect(404);
    });

    test('Shouldn`t delete without permission', async () => {
      const parent = await createBlock().withPermission(null);

      await request(app.getHttpServer())
        .delete(`/content/block/${parent.id}`)
        .expect(403);
    });

    test('Shouldn`t delete without access', async () => {
      const parent = await createBlock().withAccess(null);

      await request(app.getHttpServer())
        .delete(`/content/block/${parent.id}`)
        .expect(403);
    });

    test('Shouldn`t delete without DELETE permission', async () => {
      await createBlock('BLOCK')
        .withPermission(PermissionMethod.READ)
        .withPermission(PermissionMethod.WRITE);

      await request(app.getHttpServer())
        .delete(`/content/block/BLOCK`)
        .expect(403);
    });
  });
});
