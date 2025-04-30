import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { CollectionEntity } from './collection.entity';
import { FileEntity } from './file.entity';

describe('File entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('File fields', () => {
    test('Should create collection', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      const inst = new FileEntity();
      inst.collection = collection;
      inst.original = 'name.txt';
      inst.mimetype = 'img';
      inst.path = '/abc/';

      await inst.save();

      expect(inst.id).toBe(1);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });
  });
});