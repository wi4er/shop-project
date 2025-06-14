import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FlagEntity } from './flag.entity';

describe('FlagEntity entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('FlagEntity fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(FlagEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should get single element list', async () => {
      await Object.assign(new FlagEntity(), {id: 'ACTIVE', label: 'active'}).save();

      const repo = source.getRepository(FlagEntity);
      const item = await repo.findOne({where: {id: 'ACTIVE'}});

      expect(item.id).toBe('ACTIVE');
      expect(item.icon).toBe(null);
      expect(item.iconSvg).toBe(null);
      expect(item.color).toBe(null);
      expect(item.sort).toBe(100);
      expect(item.created_at).toBeDefined();
      expect(item.updated_at).toBeDefined();
      expect(item.deleted_at).toBeNull();
      expect(item.version).toBe(1);
    });
  });
});