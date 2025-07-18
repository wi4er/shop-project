import { DataSource } from 'typeorm/data-source/DataSource';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { ContactEntity, UserContactType } from '../../model/contact/contact.entity';

describe('Contact deletion', () => {
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

  describe('Contact delete', () => {
    test('Should delete contact', async () => {
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      const inst = await request(app.getHttpServer())
        .delete('/personal/contact/MAIL')
        .expect(200);

      expect(inst.body).toEqual(['MAIL']);
    });

    test('Shouldn`t delete with wrong id', async () => {
      await Object.assign(
        new ContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();

      await request(app.getHttpServer())
        .delete('/personal/contact/WRONG')
        .expect(404);
    });
  });
});