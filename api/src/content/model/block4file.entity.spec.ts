import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { CollectionEntity } from '../../storage/model/collection.entity';
import { FileEntity } from '../../storage/model/file.entity';
import { BlockEntity } from './block.entity';
import { PropertyEntity } from '../../settings/model/property.entity';
import { Block4fileEntity } from './block4file.entity';

describe('Block file property entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Block file fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Block4fileEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create duplicate', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const file = await Object.assign(new FileEntity(), {collection}).save();
      const parent = await Object.assign(new BlockEntity(), {}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      await Object.assign(new Block4fileEntity(), {parent, property, file}).save();

      await expect(
        Object.assign(new Block4fileEntity(), {parent, property, file}).save(),
      ).rejects.toThrow('duplicate');
    });

    test('Shouldn`t create without file', async () => {
      const parent = await Object.assign(new BlockEntity(), {}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Block4fileEntity(), {parent, property}).save(),
      ).rejects.toThrow('fileId');
    });

    test('Shouldn`t create without parent', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const file = await Object.assign(new FileEntity(), {collection}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Block4fileEntity(), {file, property}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const parent = await Object.assign(new BlockEntity(), {}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const file = await Object.assign(new FileEntity(), {collection}).save();

      await expect(
        Object.assign(new Block4fileEntity(), {parent, file}).save(),
      ).rejects.toThrow('propertyId');
    });
  });

  describe('Block with file', () => {
    test('Should create element with file', async () => {
      const repo = source.getRepository(BlockEntity);
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      const file = await Object.assign(new FileEntity(), {collection}).save();

      await Object.assign(new Block4fileEntity(), {parent, property, file}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {file: {file: {collection: true}}},
      });

      expect(inst.file).toHaveLength(1);
      expect(inst.file[0].file.collection.id).toBe('DETAIL');
    });

    test('Should create with multi file', async () => {
      const repo = source.getRepository(BlockEntity);
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

      for (let i = 0; i < 10; i++) {
        const file = await Object.assign(new FileEntity(), {collection}).save();
        await Object.assign(new Block4fileEntity(), {parent, property, file}).save();
      }

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {file: {file: {collection: true}}},
      });

      expect(inst.file).toHaveLength(10);
      expect(inst.file[0].file.collection.id).toBe('DETAIL');
    });
  });
});