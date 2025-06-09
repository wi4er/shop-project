import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { CollectionEntity } from './collection.entity';
import { Collection4stringEntity } from './collection4string.entity';

describe('CollectionEntity string attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('CollectionEntity string fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Collection4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create instance', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();

      const inst = await Object.assign(
        new Collection4stringEntity(),
        {string: 'VALUE', parent, attribute},
      ).save();

      expect(inst.version).toBe(1);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Collection4stringEntity(), {string: 'VALUE', property}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const parent = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();

      await expect(
        Object.assign(new Collection4stringEntity(), {string: 'VALUE', parent}).save(),
      ).rejects.toThrow('attributeId');
    });
  });

  describe('CollectionEntity with strings', () => {
    test('Should create collection with string', async () => {
      const repo = source.getRepository(CollectionEntity);

      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      await Object.assign(new Collection4stringEntity(), {string: 'VALUE', parent, attribute}).save();

      const inst = await repo.findOne({
        where: {id: 'SHORT'},
        relations: {string: {attribute: true}},
      });

      expect(inst.string).toHaveLength(1);
      expect(inst.string[0].string).toBe('VALUE');
      expect(inst.string[0].attribute.id).toBe('NAME');
    });
  });
});