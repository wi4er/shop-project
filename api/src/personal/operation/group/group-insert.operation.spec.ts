import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { GroupEntity } from '../../model/group/group.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('Group addition', () => {
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

  describe('Group addition', () => {
    test('Should add group', async () => {
      const inst = await request(app.getHttpServer())
        .post('/personal/group')
        .expect(201);

      expect(inst.body.id).toHaveLength(36);
    });

    test('Should add with parent', async () => {
      await Object.assign(new GroupEntity(), {id: '111'}).save();
      const inst = await request(app.getHttpServer())
        .post('/personal/group')
        .send({parent: '111'})
        .expect(201);

      expect(inst.body.id).toHaveLength(36);
      expect(inst.body.parent).toBe('111');
    });

    test('Shouldn`t add with wrong parent', async () => {
      await new GroupEntity().save();
      const inst = await request(app.getHttpServer())
        .post('/personal/group')
        .send({
          parent: 777,
        })
        .expect(400);
    });

    test('Should add with strings', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/personal/group')
        .send({
          attribute: [{attribute: 'NAME', string: 'VALUE'}],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Shouldn`t with wrong attribute', async () => {
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .post('/personal/group')
        .send({
          attribute: [{attribute: 'WRONG', string: 'VALUE'}],
        })
        .expect(400);
    });

    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'OLD'}).save();

      const inst = await request(app.getHttpServer())
        .post('/personal/group')
        .send({
          flag: ['OLD'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['OLD']);
    });

    test('Should n`t add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'OLD'}).save();

      await request(app.getHttpServer())
        .post('/personal/group')
        .send({flag: ['WRONG']})
        .expect(400);
    });
  });
});