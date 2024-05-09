import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { LangEntity } from './lang.entity';
import { Lang2flagEntity } from './lang2flag.entity';
import { FlagEntity } from './flag.entity';

describe('LangFlag entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('LangFlag fields', () => {
    test('Should add item', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new LangEntity(), {id: 'UA'}).save();

      const inst = new Lang2flagEntity();
      inst.flag = flag;
      inst.parent = parent;
      await inst.save();

      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Shouldn`t ad with same flag and parent', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new LangEntity(), {id: 'UA'}).save();

      const inst = new Lang2flagEntity();
      inst.flag = flag;
      inst.parent = parent;
      await inst.save();

      const again = new Lang2flagEntity();
      again.flag = flag;
      again.parent = parent;
      await expect(again.save()).rejects.toThrow();
    });

    test('Shouldn`t add without flag', async () => {
      const parent = await Object.assign(new LangEntity(), {id: 'UA'}).save();

      const inst = new Lang2flagEntity();
      inst.parent = parent;
      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t add without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'NAME'}).save();

      const inst = new Lang2flagEntity();
      inst.flag = flag;
      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });

  describe('Lang with flags', () => {
    test('Should add item', async () => {
      const parent = await Object.assign(new LangEntity(), {id: 'UA'}).save();

      for (let i = 0; i < 10; i++) {
        const flag = await Object.assign(new FlagEntity(), {id: `NAME_${i}`}).save();

        const inst = new Lang2flagEntity();
        inst.flag = flag;
        inst.parent = parent;
        await inst.save();
      }

      const repo = source.getRepository(LangEntity);

      const item = await repo.findOne({
        where: {id: 'UA'},
        relations: {flag: true},
      });

      expect(item.flag).toHaveLength(10);
    });
  });
});