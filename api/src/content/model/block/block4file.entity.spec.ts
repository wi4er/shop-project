import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { FileEntity } from '../../../storage/model/file/file.entity';
import { BlockEntity } from './block.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { Block4fileEntity } from './block4file.entity';

describe('BlockEntity file attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('BlockEntity file fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Block4fileEntity);
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
          path: `txt/txt1.txt`,
        },
      ).save();
      const parent = await Object.assign(new BlockEntity(), {}).save();
      const property = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await Object.assign(new Block4fileEntity(), {parent, property, file}).save();

      await expect(
        Object.assign(new Block4fileEntity(), {parent, property, file}).save(),
      ).rejects.toThrow('duplicate');
    });

    test('Shouldn`t create without file', async () => {
      const parent = await Object.assign(new BlockEntity(), {}).save();
      const property = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Block4fileEntity(), {parent, property}).save(),
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
          path: `txt/txt1.txt`,
        },
      ).save();
      const property = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Block4fileEntity(), {file, property}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const parent = await Object.assign(new BlockEntity('BLOCK'), {}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const file = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt1.txt`,
        },
      ).save();

      await expect(
        Object.assign(new Block4fileEntity(), {parent, file}).save(),
      ).rejects.toThrow('propertyId');
    });
  });

  describe('BlockEntity with file', () => {
    test('Should create element with file', async () => {
      const repo = source.getRepository(BlockEntity);
      const parent = await new BlockEntity('BLOCK').save();
      const property = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      const file = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt1.txt`,
        },
      ).save();

      await Object.assign(new Block4fileEntity(), {parent, property, file}).save();

      const inst = await repo.findOne({
        where: {id: 'BLOCK'},
        relations: {file: {file: {collection: true}}},
      });

      expect(inst.file).toHaveLength(1);
      expect(inst.file[0].file.collection.id).toBe('DETAIL');
    });

    test('Should create with multi file', async () => {
      const repo = source.getRepository(BlockEntity);
      const parent = await new BlockEntity('BLOCK').save();
      const property = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

      for (let i = 0; i < 10; i++) {
        const file = await Object.assign(
          new FileEntity(),
          {
            collection,
            original: 'name.txt',
            mimetype: 'image/jpeg',
            path: `txt/txt${i}.txt`,
          },
        ).save();
        await Object.assign(new Block4fileEntity(), {parent, property, file}).save();
      }

      const inst = await repo.findOne({
        where: {id: 'BLOCK'},
        relations: {file: {file: {collection: true}}},
      });

      expect(inst.file).toHaveLength(10);
      expect(inst.file[0].file.collection.id).toBe('DETAIL');
    });
  });
});