import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { ElementEntity } from '../../model/element/element.entity';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { BlockEntity } from '../../model/block/block.entity';
import * as request from 'supertest';

describe('Element deletion', () => {
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

  async function createElement1(block: number = 1): Promise<ElementEntity> {
    const parent = await Object.assign(new ElementEntity, {block}).save();
    await Object.assign(
      new Element2permissionEntity(),
      {parent, group: '1', method: PermissionMethod.ALL},
    ).save();

    return parent;
  }

  function createElement(id?: string): Promise<ElementEntity> & any {
    const item = new ElementEntity();
    item.id = id;

    let permission = null;

    const operations = {
      withBlock(block: BlockEntity) {
        item.block = block;
        return this;
      },
      withSort(sort: number) {
        item.sort = sort;
        return this;
      },
      withVersion(version: number) {
        item.version = version;
        return this;
      },
      withPermission(
        group: string | null,
        method: PermissionMethod | null = PermissionMethod.ALL,
      ) {
        if (!permission) permission = [];
        if (method) permission.push({group, method});
        return this;
      },
    };

    return Object.assign(Promise.resolve({
      then: resolve => resolve(item.save().then(async parent => {
        for (const perm of permission ?? [{group: null, method: PermissionMethod.ALL}]) {
          await Object.assign(
            new Element2permissionEntity(),
            {parent, group: perm.group, method: perm.method},
          ).save();
        }

        return parent;
      })),
    }), operations);
  }

  describe('Content element item deletion', () => {
    test('Should delete block', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);

      const list = await request(app.getHttpServer())
        .delete(`/content/element/ELEMENT`)
        .expect(200);

      expect(list.body).toEqual(['ELEMENT']);
    });

    test('Shouldn`t delete with wrong id', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block);

      await request(app.getHttpServer())
        .delete('/content/element/WRONG')
        .expect(404);
    });

    test('Shouldn`t delete without permission', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await createElement('ELEMENT').withBlock(block).withPermission(null, null);

      await request(app.getHttpServer())
        .delete('/content/element/ELEMENT')
        .expect(403);
    });
  });
});