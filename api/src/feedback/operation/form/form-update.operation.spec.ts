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
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { FieldEntity } from '../../../settings/model/field/field.entity';

describe('Form update', () => {
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

  describe('Form field update ', () => {
    test('Should update form', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({id: 'ORDER'})
        .expect(200);

      expect(inst.body.id).toBe('ORDER');
    });

    test('Should update id', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({id: 'UPDATED'})
        .expect(200);

      expect(inst.body.id).toBe('UPDATED');
    });
  });

  describe('Form update with string', () => {
    test('Should add strings', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
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
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
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

  });

  describe('Form update with flags', () => {
    test('Should add flags', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
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

  describe('Form update with fields', () => {
    test('Should add field', async () => {
      await Object.assign(new AccessEntity(), {target: AccessTarget.FORM, method: AccessMethod.ALL}).save();
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();
      await Object.assign(new FieldEntity(), {id: 'DATA'}).save();

      const inst = await request(app.getHttpServer())
        .put('/feedback/form/ORDER')
        .send({
          id: 'ORDER',
          field: ['DATA'],
        })
        .expect(200);

      expect(inst.body.field).toEqual(['DATA']);
    });
  });
});
