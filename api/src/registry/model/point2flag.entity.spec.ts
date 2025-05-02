import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { DirectoryEntity } from './directory.entity';
import { PointEntity } from './point.entity';
import { Point2flagEntity } from './point2flag.entity';
import { FlagEntity } from '../../settings/model/flag.entity';

describe('Point2Flag entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Point2Flag fields', () => {
    test('Should create', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'London', directory}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = new Point2flagEntity();
      inst.parent = parent;
      inst.flag = flag;
      await inst.save();

      expect(inst.id).toBe(1);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBe(null);
      expect(inst.version).toBe(1);
      expect(inst.flag.id).toBe('ACTIVE');
      expect(inst.parent.id).toBe('London');
    });

    test('Shouldn`t create without flag', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'London', directory}).save();
      const inst = Object.assign(new Point2flagEntity(), {parent});

      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t create without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'PASSIVE'}).save();
      const inst = Object.assign(new Point2flagEntity(), {flag});

      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });
});