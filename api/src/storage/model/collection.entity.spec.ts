import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { CollectionEntity } from './collection.entity';

describe('Collection entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Collection fields', () => {
    test('Should create collection', async () => {
      const inst = new CollectionEntity();
      inst.id = 'detail';

      await inst.save();

      expect(inst.id).toBe('detail');
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Shouldn`t create without id', async () => {
      const inst = new CollectionEntity();

      await expect(inst.save()).rejects.toThrow('id');
    });

    test('Shouldn`t create with blank id', async () => {
      const inst = new CollectionEntity();
      inst.id = '';

      await expect(inst.save()).rejects.toThrow('not_empty_id');
    });
  });
});