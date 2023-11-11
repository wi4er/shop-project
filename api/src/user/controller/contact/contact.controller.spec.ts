import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { UserGroupEntity } from '../../model/user-group.entity';
import { PropertyEntity } from '../../../property/model/property.entity';
import { UserGroup2stringEntity } from '../../model/user-group2string.entity';
import { LangEntity } from '../../../lang/model/lang.entity';
import { FlagEntity } from '../../../flag/model/flag.entity';
import { UserGroup2flagEntity } from '../../model/user-group2flag.entity';
import { UserContactEntity, UserContactType } from '../../model/user-contact.entity';
import { UserContact2stringEntity } from '../../model/user-contact2string.entity';
import { UserContact2flagEntity } from '../../model/user-contact2flag.entity';

describe('ContactController', () => {
  let source;
  let app;

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule({imports: [AppModule]}).compile();
    app = moduleBuilder.createNestApplication();
    app.init();

    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Contact fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/contact')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get contact instance', async () => {
      await Object.assign(new UserContactEntity(), {id: 'MAIL', type: UserContactType.EMAIL}).save();

      const res = await request(app.getHttpServer())
        .get('/contact')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('MAIL');
      expect(res.body[0].type).toBe('EMAIL');
    });
  });

  describe('Contact with strings', () => {
    test('Should get contact with strings', async () => {
      const parent = await Object.assign(
        new UserContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new UserContact2stringEntity(), {parent, property, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/contact')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('MAIL');
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
    });
  });

  describe('Contact with flags', () => {
    test('Should get contact with flag', async () => {
      const parent = await Object.assign(
        new UserContactEntity(),
        {id: 'MAIL', type: UserContactType.EMAIL},
      ).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new UserContact2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/contact')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });
});
