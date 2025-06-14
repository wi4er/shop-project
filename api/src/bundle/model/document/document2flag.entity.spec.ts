import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { DocumentEntity } from './document.entity';
import { Document2flagEntity } from './document2flag.entity';

describe('Document2Flag entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Document2Flag fields', () => {
    test('Should add item', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'NAME'}).save();
      const parent = await new DocumentEntity().save();

      const inst = new Document2flagEntity();
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
      const parent = await new DocumentEntity().save();

      const inst = new Document2flagEntity();
      inst.flag = flag;
      inst.parent = parent;
      await inst.save();

      const again = new Document2flagEntity();
      again.flag = flag;
      again.parent = parent;
      await expect(again.save()).rejects.toThrow();
    });

    test('Shouldn`t add without flag', async () => {
      const parent = await new DocumentEntity().save();

      const inst = new Document2flagEntity();
      inst.parent = parent;
      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t add without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'NAME'}).save();

      const inst = new Document2flagEntity();
      inst.flag = flag;
      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });

  describe('Document with flags', () => {
    test('Should add item', async () => {
      const parent = await new DocumentEntity().save();

      for (let i = 0; i < 10; i++) {
        const flag = await Object.assign(new FlagEntity(), {id: `NAME_${i}`}).save();

        const inst = new Document2flagEntity();
        inst.flag = flag;
        inst.parent = parent;
        await inst.save();
      }

      const repo = source.getRepository(DocumentEntity);

      const item = await repo.findOne({
        where: {id: parent.id},
        relations: {flag: true},
      });

      expect(item.flag).toHaveLength(10);
    });
  });
});