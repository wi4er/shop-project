import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { DirectoryEntity } from './directory.entity';
import { Directory2flagEntity } from './directory2flag.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('Directory to flag entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Directory to flag fields', () => {
    test('Should create', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = new Directory2flagEntity();
      inst.parent = parent;
      inst.flag = flag;
      await inst.save();

      expect(inst.id).toBe(1);
      expect(inst.flag.id).toBe('ACTIVE');
      expect(inst.parent.id).toBe('CITY');
    });

    test('Shouldn`t create without flag', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const inst = Object.assign(new Directory2flagEntity(), {parent});

      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t create without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'PASSIVE'}).save();
      const inst = Object.assign(new Directory2flagEntity(), {flag});

      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });
});