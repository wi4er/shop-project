import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { File4stringEntity } from './file4string.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { CollectionEntity } from '../collection/collection.entity';
import { FileEntity } from './file.entity';

describe('File string attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('File string fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(File4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create instance', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
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

      const inst = await Object.assign(new File4stringEntity(), {string: 'VALUE', parent, attribute}).save();

      expect(inst.version).toBe(1);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new File4stringEntity(), {string: 'VALUE', attribute}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
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
      ).rejects.toThrow('attributeId');
    });
  });

  describe('File with strings', () => {
    test('Should create file with string', async () => {
      const repo = source.getRepository(FileEntity);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
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

      await Object.assign(new File4stringEntity(), {string: 'VALUE', parent, attribute}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {string: {attribute: true}},
      });

      expect(inst.string).toHaveLength(1);
      expect(inst.string[0].string).toBe('VALUE');
      expect(inst.string[0].attribute.id).toBe('NAME');
    });
  });
});