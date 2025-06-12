import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { ElementEntity } from './element.entity';
import { BlockEntity } from '../block/block.entity';

describe('ElementEntity entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('ElementEntity fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(ElementEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should add item', async () => {
      await new BlockEntity().save();
      const item = await Object.assign(
        new ElementEntity(),
        {id: 'NAME', block: 1},
      ).save();

      expect(item.id).toBe('NAME');
      expect(item.sort).toBe(100);
      expect(item.created_at).toBeDefined();
      expect(item.updated_at).toBeDefined();
      expect(item.deleted_at).toBeNull();
      expect(item.version).toBe(1);
    });

    test('Should add without id', async () => {
      await new BlockEntity().save();
      const item = await Object.assign(
        new ElementEntity(),
        {block: 1},
      ).save();

      expect(item.id).toHaveLength(36);
    });

    test('Should get item', async () => {
      await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {id: 'NAME', block: 1}).save();

      const repo = source.getRepository(ElementEntity);
      const item = await repo.findOne({
        where: {id: 'NAME'},
        relations: {block: true},
      });

      expect(item.id).toBe('NAME');
      expect(item.created_at).toBeDefined();
      expect(item.updated_at).toBeDefined();
      expect(item.deleted_at).toBeNull();
      expect(item.version).toBe(1);
      expect(item.block.id).toBe(1);
    });

    test('Shouldn`t add with blank id', async () => {
      await new BlockEntity().save();
      const item = Object.assign(
        new ElementEntity(),
        {id: '', block: 1},
      );

      await expect(item.save()).rejects.toThrow('not_empty_id');
    });

    test('Shouldn`t create without block', async () => {
      const inst = Object.assign(new ElementEntity(), {id: 'NAME'});

      await expect(inst.save()).rejects.toThrow('blockId');
    });

    test('Shouldn`t create with wrong block', async () => {
      await new BlockEntity().save();
      const inst = Object.assign(
        new ElementEntity(),
        {id: 'NAME', block: 777},
      );

      await expect(inst.save()).rejects.toThrow('foreign key constraint');
    });
  });
});