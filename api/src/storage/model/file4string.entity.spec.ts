import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { File4stringEntity } from './file4string.entity';
import { PropertyEntity } from '../../settings/model/property.entity';
import { CollectionEntity } from './collection.entity';
import { FileEntity } from './file.entity';

describe('File string property entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('File string fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(File4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create instance', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: 'txt/txt.txt',
        },
      ).save();

      const inst = await Object.assign(new File4stringEntity(), {string: 'VALUE', parent, property}).save();

      expect(inst.version).toBe(1);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new File4stringEntity(), {string: 'VALUE', property}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: 'txt/txt.txt',
        },
      ).save();

      await expect(
        Object.assign(new File4stringEntity(), {string: 'VALUE', parent}).save(),
      ).rejects.toThrow('propertyId');
    });
  });

  describe('File with strings', () => {
    test('Should create file with string', async () => {
      const repo = source.getRepository(FileEntity);
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: 'txt/txt.txt',
        },
      ).save();

      await Object.assign(new File4stringEntity(), {string: 'VALUE', parent, property}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {string: {property: true}},
      });

      expect(inst.string).toHaveLength(1);
      expect(inst.string[0].string).toBe('VALUE');
      expect(inst.string[0].property.id).toBe('NAME');
    });
  });
});