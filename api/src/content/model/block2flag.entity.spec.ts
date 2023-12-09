import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { Block4stringEntity } from './block4string.entity';
import { BlockEntity } from './block.entity';
import { Block2flagEntity } from './block2flag.entity';
import { FlagEntity } from '../../settings/model/flag.entity';

describe('Block2flag entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Block2flag fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Block4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create block flag', async () => {
      const parent = await new BlockEntity().save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const inst = await Object.assign(new Block2flagEntity(), {flag, parent}).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create without flag', async () => {
      const parent = await new BlockEntity().save();
      const inst = Object.assign(new Block2flagEntity(), {parent});

      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t create without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const inst = Object.assign(new Block2flagEntity(), {flag});

      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });

  describe('Block with flags', () => {
    test('Shouldn`t have duplicate flag', async () => {
      const parent = await new BlockEntity().save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Block2flagEntity(), {flag, parent}).save();
      await expect(
        Object.assign(new Block2flagEntity(), {flag, parent}).save(),
      ).rejects.toThrow();
    });
  });
});