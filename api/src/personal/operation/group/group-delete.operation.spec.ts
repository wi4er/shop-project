import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { GroupEntity } from '../../model/group/group.entity';
import * as request from 'supertest';

describe('GroupController', () => {
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

  describe('Group delete', () => {
    test('Should delete group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      const inst = await request(app.getHttpServer())
        .delete('/personal/group/111')
        .expect(200);

      expect(inst.body).toEqual(['111']);
    });

    test('Shouldn`t delete with wrong group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      await request(app.getHttpServer())
        .delete('/personal/group/777')
        .expect(404);
    });
  });
});