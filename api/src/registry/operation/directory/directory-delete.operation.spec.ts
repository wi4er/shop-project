import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { DirectoryEntity } from '../../model/directory/directory.entity';
import { Directory2permissionEntity } from '../../model/directory/directory2permission.entity';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { AccessTarget } from '../../../personal/model/access/access-target';
import * as request from 'supertest';

describe('Directory deletion', () => {
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

  async function createDirectory(
    id: string,
    method: PermissionMethod = PermissionMethod.ALL,
    permission: boolean = true,
  ) {
    const parent = await Object.assign(new DirectoryEntity(), {id}).save();
    if (permission) await Object.assign(new Directory2permissionEntity(), {parent, method}).save();
    await source.getRepository(AccessEntity).findOne({
      where: {
        method: AccessMethod.ALL,
        target: AccessTarget.DIRECTORY,
      },
    })
      .then(inst => {
        if (!inst) return Object.assign(new AccessEntity(), {
          method: AccessMethod.ALL,
          target: AccessTarget.DIRECTORY,
        }).save();
      });

    return parent;
  }

  describe('Directory deletion', () => {
    test('Should delete item', async () => {
      await createDirectory('CITY');

      const res = await request(app.getHttpServer())
        .delete('/registry/directory/CITY')
        .expect(200);

      expect(res.body).toEqual(['CITY']);
    });

    test('Shouldn`t delete without access', async () => {
      await createDirectory('CITY', PermissionMethod.ALL, false);

      await request(app.getHttpServer())
        .delete('/registry/directory/CITY')
        .expect(403);
    });

    test('Shouldn`t delete without DELETE access', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new Directory2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.GET, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.POST, target: AccessTarget.DIRECTORY}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.PUT, target: AccessTarget.DIRECTORY}).save();

      await request(app.getHttpServer())
        .delete('/registry/directory/CITY')
        .expect(403);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await createDirectory('CITY');

      await request(app.getHttpServer())
        .delete('/registry/directory/WRONG')
        .expect(404);
    });

    test('Shouldn`t delete without access]', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new AccessEntity(), {method: AccessMethod.ALL, target: AccessTarget.DIRECTORY}).save();

      await request(app.getHttpServer())
        .delete('/registry/directory/CITY')
        .expect(403);
    });
  });
});