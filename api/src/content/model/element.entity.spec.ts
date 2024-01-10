import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { ElementEntity } from './element.entity';
import { BlockEntity } from './block.entity';

describe('Element entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(ElementEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should get item', async () => {
      await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {block: 1}).save();

      const repo = source.getRepository(ElementEntity);
      const item = await repo.findOne({
        where: {id: 1},
        relations: {block: true},
      });

      expect(item.id).toBe(1);
      expect(item.created_at).toBeDefined();
      expect(item.updated_at).toBeDefined();
      expect(item.deleted_at).toBeNull();
      expect(item.version).toBe(1);
      expect(item.block.id).toBe(1);
    });

    test('Shouldn`t create without block', async () => {
      const inst = Object.assign(new ElementEntity(), {});

      await expect(inst.save()).rejects.toThrow('blockId');
    });

    test('Shouldn`t create with wrong block', async () => {
      await new BlockEntity().save();
      const inst = Object.assign(new ElementEntity(), {block: 777});

      await expect(inst.save()).rejects.toThrow('foreign key constraint');
    });
  });
});