import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FlagEntity } from './flag.entity';

describe('Flag entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  describe('Flag fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(FlagEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should get single element list', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE', label: 'active'}).save();

      const repo = source.getRepository(FlagEntity);
      const list = await repo.find();

      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('ACTIVE');
      expect(list[0].sort).toBe(100);
      expect(list[0].created_at).toBeDefined();
      expect(list[0].updated_at).toBeDefined();
      expect(list[0].deleted_at).toBeNull();
      expect(list[0].version).toBe(1);
    });
  });
});