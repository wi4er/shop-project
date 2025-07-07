import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FormEntity } from '../../model/form/form.entity';
import * as request from 'supertest';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { Form4stringEntity } from '../../model/form/form4string.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('Form addition', () => {
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

  describe('Form update', () => {
    test('Should update feedback', async () => {
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({id: 'ORDER'})
        .expect(200);

      expect(inst.body.id).toBe('ORDER');
    });

    test('Should update id', async () => {
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({id: 'UPDATED'})
        .expect(200);

      expect(inst.body.id).toBe('UPDATED');
    });

    test('Should add strings', async () => {
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({
          id: 'ORDER',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(200);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Should update strings', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Form4stringEntity(), {attribute, parent, string: 'OLD'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({
          id: 'UPDATED',
          attribute: [
            {attribute: 'NAME', string: 'NEW'},
          ],
        })
        .expect(200);

      expect(inst.body.id).toBe('UPDATED');
      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('NEW');
    });

    test('Should add flags', async () => {
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({
          id: 'ORDER',
          flag: ['ACTIVE'],
        })
        .expect(200);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });
  });
});
