import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { SectionEntity } from '../../model/section/section.entity';
import { BlockEntity } from '../../model/block/block.entity';
import { Section2permissionEntity } from '../../model/section/section2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';

describe('Section deletion', () => {
  let source: DataSource;
  let app: INestApplication;

  async function createSection(id = 'SECTION'): Promise<SectionEntity> {
    await new BlockEntity('BLOCK').save();
    const parent = await Object.assign(new SectionEntity(), {id, block: 'BLOCK'}).save();
    await Object.assign(new Section2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();

    return parent;
  }

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());
  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule({imports: [AppModule]}).compile();
    app = moduleBuilder.createNestApplication();
    await app.init();

    source = await createConnection(createConnectionOptions());
  });

  describe('Content section item deletion', () => {
    test('Should delete section', async () => {
      await createSection();

      const inst = await request(app.getHttpServer())
        .delete('/content/section/SECTION')
        .expect(200);

      expect(inst.body).toEqual(['SECTION']);
    });

    test('Shouldn`t delete with wrong ID', async () => {
      await createSection();

      await request(app.getHttpServer())
        .delete('/content/section/WRONG')
        .expect(404);
    });

    test('Shouldn`t delete without permission', async () => {
      const block = await new BlockEntity('BLOCK').save();
      await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();

      await request(app.getHttpServer())
        .delete('/content/section/SECTION')
        .expect(403);
    });

    test('Shouldn`t delete without DELETE permission', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();
      await Object.assign(new Section2permissionEntity(), {parent, method: PermissionMethod.READ}).save();
      await Object.assign(new Section2permissionEntity(), {parent, method: PermissionMethod.WRITE}).save();

      await request(app.getHttpServer())
        .delete('/content/section/SECTION')
        .expect(403);
    });
  });

});