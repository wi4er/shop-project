import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import * as request from 'supertest';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { PropertyEntity } from '../../../settings/model/property.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { DocumentEntity } from '../../model/document.entity';
import { Document4stringEntity } from '../../model/document4string.entity';
import { Document2flagEntity } from '../../model/document2flag.entity';

describe('DocumentController', () => {
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

  describe('Document fields', () => {
    test('Should get empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/document')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    test('Should get document instance', async () => {
      await new DocumentEntity().save();

      const res = await request(app.getHttpServer())
        .get('/document/1')
        .expect(200);

      expect(res.body.id).toBe(1);
    });

    test('Should get document with limit', async () => {
      for (let i = 0; i < 10; i++) {
        await new DocumentEntity().save();
      }

      const res = await request(app.getHttpServer())
        .get('/document?limit=3')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe(1);
      expect(res.body[1].id).toBe(2);
      expect(res.body[2].id).toBe(3);
    });

    test('Should get document with offset', async () => {
      for (let i = 0; i < 10; i++) {
        await new DocumentEntity().save();
      }

      const res = await request(app.getHttpServer())
        .get('/document?offset=9')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(10);
    });
  });

  describe('Document count', () => {
    test('Should get empty count', async () => {
      const res = await request(app.getHttpServer())
        .get('/document/count')
        .expect(200);

      expect(res.body).toEqual({count: 0});
    });

    test('Should get document count', async () => {
      for (let i = 0; i < 10; i++) {
        await new DocumentEntity().save();
      }

      const res = await request(app.getHttpServer())
        .get('/document/count')
        .expect(200);

      expect(res.body).toEqual({count: 10});
    });
  });

  describe('Document with strings', () => {
    test('Should get flag with strings', async () => {
      const parent = await new DocumentEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new Document4stringEntity(), {parent, property, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/document')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(1);
      expect(res.body[0].property).toHaveLength(1);
      expect(res.body[0].property[0].property).toBe('NAME');
      expect(res.body[0].property[0].lang).toBeUndefined();
      expect(res.body[0].property[0].string).toBe('VALUE');
    });

    test('Should get flag with lang strings', async () => {
      const parent = await new DocumentEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      await Object.assign(new Document4stringEntity(), {parent, property, lang, string: 'VALUE'}).save();

      const res = await request(app.getHttpServer())
        .get('/document')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].property[0].lang).toBe('EN');
      expect(res.body[0].property[0].string).toBe('VALUE');
      expect(res.body[0].property[0].property).toBe('NAME');
    });
  });

  describe('Document with flags', () => {
    test('Should get flag with flag', async () => {
      const parent = await new DocumentEntity().save();
      const flag = await Object.assign(new FlagEntity(), {id: 'FLAG'}).save();
      await Object.assign(new Document2flagEntity(), {parent, flag}).save();

      const list = await request(app.getHttpServer())
        .get('/document')
        .expect(200);

      expect(list.body).toHaveLength(1);
      expect(list.body[0].flag).toEqual(['FLAG']);
    });
  });

  describe('Document addition', () => {
    test('Should add item', async () => {
      const inst = await request(app.getHttpServer())
        .post('/document')
        .send({})
        .expect(201);

      expect(inst.body.id).toBe(1);
    });

    test('Should add with string', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const inst = await request(app.getHttpServer())
        .post('/document')
        .send({
          property: [{property: 'NAME', string: 'VALUE'}],
        })
        .expect(201);

      expect(inst.body.id).toBe(1);
      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].string).toBe('VALUE');
    });

    test('Should add with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const inst = await request(app.getHttpServer())
        .post('/document')
        .send({
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.id).toBe(1);
      expect(inst.body.flag).toEqual(['ACTIVE']);
    });
  });

  describe('Document updating', () => {
    test('Should update document', async () => {
      await new DocumentEntity().save();

      const res = await request(app.getHttpServer())
        .put('/document/1')
        .send({id: 1})
        .expect(200);

      expect(res.body.id).toBe(1);
    });

    test('Shouldn`t update with wriong id', async () => {
      await new DocumentEntity().save();

      const res = await request(app.getHttpServer())
        .put('/document/99')
        .send({id: 1})
        .expect(404);
    });

    test('Should update with string', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await new DocumentEntity().save();

      const inst = await request(app.getHttpServer())
        .put('/document/1')
        .send({
          property: [{property: 'NAME', string: 'VALUE'}],
        })
        .expect(200);

      expect(inst.body.id).toBe(1);
      expect(inst.body.property[0].property).toBe('NAME');
      expect(inst.body.property[0].string).toBe('VALUE');
    });

    test('Should update with flag', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await new DocumentEntity().save();

      const inst = await request(app.getHttpServer())
        .put('/document/1')
        .send({flag: ['ACTIVE']})
        .expect(200);

      expect(inst.body.id).toBe(1);
      expect(inst.body.flag).toEqual(['ACTIVE']);
    });
  });
});
