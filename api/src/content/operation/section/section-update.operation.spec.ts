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
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { FileEntity } from '../../../storage/model/file/file.entity';
import { Section2imageEntity } from '../../model/section/section2image.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { Section4stringEntity } from '../../model/section/section4string.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { Section2flagEntity } from '../../model/section/section2flag.entity';

describe('Section updating', () => {
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

  describe('Content section fields update', () => {
    test('Should update id', async () => {
      await createSection();

      const inst = await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({id: 'UPDATED', block: 'BLOCK'})
        .expect(200);

      expect(inst.body.id).toEqual('UPDATED');
    });

    test('Shouldn`t update to blank', async () => {
      await createSection();

      await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({id: '', block: 'BLOCK'})
        .expect(400);
    });

    test('Should update sort', async () => {
      await createSection();

      const inst = await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({id: 'SECTION', sort: 777, block: 'BLOCK'})
        .expect(200);

      expect(inst.body.sort).toBe(777);
    });
  });

  describe('Content section update with block', () => {
    test('Should update item', async () => {
      await createSection();

      const inst = await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({id: 'SECTION', block: 'BLOCK'})
        .expect(200);

      expect(inst.body.id).toEqual('SECTION');
    });

    test('Shouldn`t update without block', async () => {
      await createSection();

      await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({})
        .expect(400);
    });

    test('Shouldn`t update with wrong block', async () => {
      await createSection();

      await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({block: 999})
        .expect(400);
    });
  });

  describe('Content section update with access', () => {
    test('Should update access', async () => {
      await createSection();

      const inst = await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({id: 'SECTION', block: 'BLOCK', permission: [{method: 'READ'}]})
        .expect(200);

      expect(inst.body.permission).toEqual([{method: 'READ'}]);
    });

    test('Shouldn`t update with wrong method', async () => {
      await createSection();

      await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({id: 'SECTION', block: 'BLOCK', permission: [{method: 'WRONG'}]})
        .expect(400);
    });

    test('Should add group access', async () => {
      await createSection();
      await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();

      const inst = await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({
          id: 'SECTION',
          block: 'BLOCK',
          permission: [
            {method: 'ALL'},
            {method: 'READ', group: 'GROUP'},
          ],
        })
        .expect(200);

      expect(inst.body.permission).toContainEqual({method: 'READ', group: 'GROUP'});
    });

    test('Shouldn`t update with wrong goup', async () => {
      await createSection();

      await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({id: 'SECTION', block: 1, permission: [{method: 'READ', group: 'WRONG'}]})
        .expect(400);
    });
  });

  describe('Content section update with image', () => {
    test('Should add image', async () => {
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
      await createSection();

      const inst = await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({id: 'SECTION', block: 'BLOCK', image: [1]})
        .expect(200);

      expect(inst.body.image).toHaveLength(1);
      expect(inst.body.image[0].original).toBe('name.txt');
      expect(inst.body.image[0].path).toBe('txt/txt.txt');
    });

    test('Should remove image', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const image = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt.txt`,
        },
      ).save();

      const parent = await createSection();
      await Object.assign(new Section2imageEntity(), {parent, image}).save();

      const inst = await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({id: 'SECTION', block: 'BLOCK', image: []})
        .expect(200);

      expect(inst.body.image).toHaveLength(0);
    });
  });

  describe('Content section update with parent', () => {
    test('Should update parent', async () => {
      await createSection();
      const parent = await Object.assign(new SectionEntity(), {id: 'CHILD', block: 'BLOCK'}).save();
      await Object.assign(new Section2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();

      const inst = await request(app.getHttpServer())
        .put('/content/section/CHILD')
        .send({id: 'CHILD', block: 'BLOCK', parent: 'SECTION'})
        .expect(200);

      expect(inst.body.id).toBe('CHILD');
      expect(inst.body.parent).toBe('SECTION');
    });

    test('Shouldn`t update with wrong parent', async () => {
      const block = await new BlockEntity('BLOCK').save();
      const parent = await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();
      await Object.assign(new Section2permissionEntity(), {parent, method: PermissionMethod.ALL}).save();

      await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({id: 'SECTION', block: 'BLOCK', parent: 'WRONG'})
        .expect(400);
    });
  });

  describe('Content section update with strings', () => {
    test('Should add strings', async () => {
      await createSection();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({
          id: 'SECTION',
          block: 'BLOCK',
          attribute: [
            {attribute: 'NAME', string: 'VALUE'},
          ],
        })
        .expect(200);

      expect(inst.body.attribute).toHaveLength(1);
      expect(inst.body.attribute[0].attribute).toBe('NAME');
      expect(inst.body.attribute[0].string).toBe('VALUE');
    });

    test('Should remove strings', async () => {
      const parent = await createSection();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new Section4stringEntity(), {parent, attribute, string: 'VALUE'}).save();

      const inst = await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({
          id: 'SECTION',
          block: 'BLOCK',
          attribute: [],
        })
        .expect(200);

      expect(inst.body.attribute).toHaveLength(0);
    });
  });

  describe('Content section update with flags', () => {
    test('Should add flag', async () => {
      await createSection();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const inst = await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({
          id: 'SECTION',
          block: 'BLOCK',
          flag: ['NEW'],
        })
        .expect(200);

      expect(inst.body.flag).toEqual(['NEW']);
    });

    test('Should update flags only', async () => {
      await createSection();
      await Object.assign(new FlagEntity(), {id: 'FLAG_1'}).save();
      await Object.assign(new FlagEntity(), {id: 'FLAG_2'}).save();

      const inst = await request(app.getHttpServer())
        .patch('/content/section/SECTION')
        .send({
          flag: ['FLAG_1', 'FLAG_2'],
        })
        .expect(200);

      expect(inst.body.flag).toEqual(['FLAG_1', 'FLAG_2']);
    });

    test('Should remove flags', async () => {
      const parent = await createSection();
      const flag = await Object.assign(new FlagEntity(), {id: 'NEW'}).save();
      await Object.assign(new Section2flagEntity(), {parent, flag}).save();

      const inst = await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({
          id: 'SECTION',
          block: 'BLOCK',
          flag: [],
        })
        .expect(200);

      expect(inst.body.flag).toEqual([]);
    });

    test('Shouldn`t add wrong flag', async () => {
      await createSection();
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      await request(app.getHttpServer())
        .put('/content/section/SECTION')
        .send({
          id: 'SECTION',
          block: 'BLOCK',
          flag: ['WRONG'],
        })
        .expect(400);
    });
  });
});