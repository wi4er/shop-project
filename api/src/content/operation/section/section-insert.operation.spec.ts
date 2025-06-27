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
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { FileEntity } from '../../../storage/model/file/file.entity';

describe('Section addition', () => {
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

  describe('Content section addition with parent', () => {
    test('Should add item', async () => {
      await new BlockEntity('BLOCK').save();

      const inst = await request(app.getHttpServer())
        .post('/content/section')
        .send({block: 'BLOCK'})
        .expect(201);

      expect(inst.body['parent']).toBeUndefined();
    });

    test('Should add with parent', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new SectionEntity(), {id: 'PARENT', block: 'BLOCK'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/section')
        .send({id: 'SECTION', block: 'BLOCK', parent: 'PARENT'})
        .expect(201);

      expect(inst.body.id).toBe('SECTION');
      expect(inst.body.block).toBe('BLOCK');
      expect(inst.body.parent).toBe('PARENT');
    });

    test('Should add with sort', async () => {
      await new BlockEntity('BLOCK').save();

      const inst = await request(app.getHttpServer())
        .post('/content/section')
        .send({sort: 888, block: 'BLOCK'})
        .expect(201);

      expect(inst.body.sort).toBe(888);
    });

    test('Shouldn`t add with wrong parent', async () => {
      await new BlockEntity().save();

      await request(app.getHttpServer())
        .post('/content/section')
        .send({block: 'BLOCK', parent: 'WRONG'})
        .expect(400);
    });
  });

  describe('Content section addition with access', () => {
    test('Should add with access', async () => {
      await new BlockEntity('BLOCK').save();

      const inst = await request(app.getHttpServer())
        .post('/content/section')
        .send({block: 'BLOCK', permission: [{method: 'READ'}]})
        .expect(201);

      expect(inst.body.permission).toEqual([{method: 'READ'}]);
    });

    test('Shouldn`t add with wrong method', async () => {
      await new BlockEntity('BLOCK').save();

      await request(app.getHttpServer())
        .post('/content/section')
        .send({block: 'BLOCK', permission: [{method: 'WRONG'}]})
        .expect(400);
    });

    test('Should add with group access', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/section')
        .send({
          block: 'BLOCK',
          permission: [
            {method: 'READ'},
            {method: 'READ', group: 'GROUP'},
          ],
        })
        .expect(201);

      expect(inst.body.permission).toContainEqual({method: 'READ', group: 'GROUP'});
    });

    test('Shouldn`t add with  wrong group', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();

      await request(app.getHttpServer())
        .post('/content/section')
        .send({
          block: 'BLOCK',
          permission: [
            {method: 'READ'},
            {method: 'READ', group: 'WRONG'},
          ],
        })
        .expect(400);
    });

    test('Should add and read with access', async () => {
      await new BlockEntity('BLOCK').save();

      await request(app.getHttpServer())
        .post('/content/section')
        .send({id: 'SECTION', block: 'BLOCK', permission: [{method: 'READ'}]})
        .expect(201);

      const inst = await request(app.getHttpServer())
        .get('/content/section/SECTION')
        .expect(200);

      expect(inst.body.permission).toEqual([{method: 'READ'}]);
    });
  });

  describe('Content section addition with string', () => {
    test('Should add with strings', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/section')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Should add with lang', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/section')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', string: 'VALUE', lang: 'EN'},
          ],
        })
        .expect(201);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
      expect(inst.body.attribute[0].lang).toBe('EN');
    });

    test('Shouldn`t add with wrong attribute', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await request(app.getHttpServer())
        .post('/content/section')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'WRONG', string: 'VALUE'},
          ],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong lang', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      await request(app.getHttpServer())
        .post('/content/section')
        .send({
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', string: 'VALUE', lang: 'WRONG'},
          ],
        })
        .expect(400);
    });
  });

  describe('Content section addition with flag', () => {
    test('Should add with flags', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = await request(app.getHttpServer())
        .post('/content/section')
        .send({
          block: 'BLOCK',
          flag: ['ACTIVE'],
        })
        .expect(201);

      expect(inst.body.flag).toEqual(['ACTIVE']);
    });

    test('Shouldn`t add with duplicate flags', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .post('/content/section')
        .send({
          block: 'BLOCK',
          flag: ['ACTIVE', 'ACTIVE'],
        })
        .expect(400);
    });

    test('Shouldn`t add with wrong flags', async () => {
      await new BlockEntity('BLOCK').save();
      await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await request(app.getHttpServer())
        .post('/content/section')
        .send({
          block: 'BLOCK',
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });

  describe('Content section addition with image', () => {
    test('Should add with image', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt.txt`,
        },
      ).save();

      await new BlockEntity('BLOCK').save();

      const inst = await request(app.getHttpServer())
        .post('/content/section')
        .send({block: 'BLOCK', image: [1]})
        .expect(201);

      expect(inst.body.image).toHaveLength(1);
      expect(inst.body.image[0].image).toBe(1);
      expect(inst.body.image[0].collection).toBe('SHORT');
      expect(inst.body.image[0].path).toBe('txt/txt.txt');
    });

    test('Shouldn`t add with wrong image', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt1.txt`,
        },
      ).save();

      await new BlockEntity('BLOCK').save();

      await request(app.getHttpServer())
        .post('/content/section')
        .send({block: 'BLOCK', image: [555]})
        .expect(400);
    });
  });

  describe('Content section addition with block', () => {
    test('Shouldn`t add section without block', async () => {
      await request(app.getHttpServer())
        .post('/content/section')
        .send({})
        .expect(400);
    });

    test('Shouldn`t add with wrong block', async () => {
      await new BlockEntity().save();
      await request(app.getHttpServer())
        .post('/content/section')
        .send({block: 2})
        .expect(400);
    });
  });
});