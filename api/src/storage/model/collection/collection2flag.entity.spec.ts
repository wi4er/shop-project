import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { CollectionEntity } from './collection.entity';
import { FileEntity } from '../file/file.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { File2flagEntity } from '../file/file2flag.entity';
import { Collection2flagEntity } from './collection2flag.entity';

describe('CollectionEntity 2 flag entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  describe('Collection2flag fields', () => {
    test('Should create collection flag', async () => {
      const parent = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const flag = await Object.assign(new FlagEntity(), { id: 'ACTIVE' }).save();

      const inst = new Collection2flagEntity();
      inst.parent = parent;
      inst.flag = flag;
      await inst.save();

      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Shouldn`t create without flag', async () => {
      const parent = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();

      const inst = new Collection2flagEntity();
      inst.parent = parent;

      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t create without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), { id: 'ACTIVE' }).save();

      const inst = new Collection2flagEntity();
      inst.flag = flag;

      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });

  describe('CollectionEntity with flag', () => {
    test('Should create collection with flag', async () => {
      const repo = source.getRepository(CollectionEntity);

      const parent = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const flag = await Object.assign(new FlagEntity(), { id: 'ACTIVE' }).save();
      await Object.assign(new Collection2flagEntity(), { parent, flag }).save();

      const inst = await repo.findOne({ where: { id: 'SHORT' }, relations: { flag: { flag: true } } });

      expect(inst.flag).toHaveLength(1);
      expect(inst.flag[0].id).toBe(1);
      expect(inst.flag[0].flag.id).toBe('ACTIVE');
    });

    test('Shouldn`t create duplicate flag', async () => {
      const parent = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const flag = await Object.assign(new FlagEntity(), { id: 'ACTIVE' }).save();
      await Object.assign(new Collection2flagEntity(), { parent, flag }).save();

      await expect(
        Object.assign(new Collection2flagEntity(), { parent, flag }).save()
      ).rejects.toThrow('duplicate key');
    });
  });
});