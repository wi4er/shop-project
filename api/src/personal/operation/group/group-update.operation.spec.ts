import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { GroupEntity } from '../../model/group/group.entity';
import * as request from 'supertest';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

describe('Group update', () => {
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

  describe('Group update', () => {
    test('Should update group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      const inst = await request(app.getHttpServer())
        .put('/personal/group/111')
        .expect(200);

      expect(inst.body.id).toBe('111');
    });

    test('Should add parent to group', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      await Object.assign(new GroupEntity(), {id: '222'}).save();

      const inst = await request(app.getHttpServer())
        .put('/personal/group/222')
        .send({parent: '111'})
        .expect(200);

      expect(inst.body.id).toBe('222');
      expect(inst.body.parent).toBe('111');
    });

    test('Shouldn`t add wrong parent', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      await Object.assign(new GroupEntity(), {id: '222'}).save();

      await request(app.getHttpServer())
        .put('/personal/group/222')
        .send({parent: '777'})
        .expect(400);
    });

    test('Should add strings', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      const inst = await request(app.getHttpServer())
        .put('/personal/group/111')
        .send({
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(200);

      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Shouldn`t update wrong attribute', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      await request(app.getHttpServer())
        .put('/personal/group/111')
        .send({
          attribute: [{attribute: 'WRONG', string: 'VALUE'}],
        })
        .expect(400);
    });

    test('Should add flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      const inst = await request(app.getHttpServer())
        .put('/personal/group/111')
        .send({flag: ['NEW']})
        .expect(200);

      expect(inst.body.flag).toEqual(['NEW']);
    });

    test('Shouldn`t add wrong flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new GroupEntity(), {id: '111'}).save();

      await request(app.getHttpServer())
        .put('/personal/group/111')
        .send({flag: ['WRONG']})
        .expect(400);
    });
  });
});