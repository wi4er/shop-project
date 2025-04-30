import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from './block.entity';
import { ElementEntity } from './element.entity';
import { CollectionEntity } from '../../storage/model/collection.entity';
import { FileEntity } from '../../storage/model/file.entity';
import { Element4fileEntity } from './element4file.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';

describe('Element file attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element file fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Element4fileEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create duplicate', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const file = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt.txt`,
        },
      ).save();
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await Object.assign(new Element4fileEntity(), {parent, attribute, file}).save();

      await expect(
        Object.assign(new Element4fileEntity(), {parent, attribute, file}).save(),
      ).rejects.toThrow('duplicate');
    });

    test('Shouldn`t create without file', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Element4fileEntity(), {parent, attribute}).save(),
      ).rejects.toThrow('fileId');
    });

    test('Shouldn`t create without parent', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const file = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt.txt`,
        },
      ).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Element4fileEntity(), {file, attribute}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const file = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt.txt`,
        },
      ).save();

      await expect(
        Object.assign(new Element4fileEntity(), {parent, file}).save(),
      ).rejects.toThrow('attributeId');
    });
  });

  describe('Element with file', () => {
    test('Should create element with file', async () => {
      const repo = source.getRepository(ElementEntity);
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      const file = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt.txt`,
        },
      ).save();

      await Object.assign(new Element4fileEntity(), {parent, attribute, file}).save();

      const inst = await repo.findOne({
        where: {id: 'NAME'},
        relations: {file: {file: {collection: true}}},
      });

      expect(inst.file).toHaveLength(1);
      expect(inst.file[0].file.collection.id).toBe('DETAIL');
    });

    test('Should create with multi file', async () => {
      const repo = source.getRepository(ElementEntity);
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

      for (let i = 0; i < 10; i++) {
        const file = await Object.assign(
          new FileEntity(),
          {
            collection,
            original: 'name.txt',
            mimetype: 'image/jpeg',
            path: `txt/txt_${i}.txt`,

          }
        ).save();
        await Object.assign(new Element4fileEntity(), {parent, attribute, file}).save();
      }

      const inst = await repo.findOne({
        where: {id: 'NAME'},
        relations: {file: {file: {collection: true}}},
      });

      expect(inst.file).toHaveLength(10);
      expect(inst.file[0].file.collection.id).toBe('DETAIL');
    });
  });
});