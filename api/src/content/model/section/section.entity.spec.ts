import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { SectionEntity } from './section.entity';
import { BlockEntity } from '../block/block.entity';

describe('SectionEntity entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('SectionEntity fields', () => {
    test('Should create section', async () => {
      const block = await new BlockEntity().save();
      const section = await Object.assign(
        new SectionEntity(),
        {id: 'SECTION', block},
      ).save();

      expect(section.id).toBe('SECTION');
      expect(section.sort).toBe(100);
      expect(section.created_at).toBeDefined();
      expect(section.updated_at).toBeDefined();
      expect(section.deleted_at).toBeNull();
      expect(section.version).toBe(1);
    });

    test('Shouldn`t create without id', async () => {
      const block = await new BlockEntity().save();
      const section = await Object.assign(new SectionEntity(), {block}).save();

      expect(section.id).toHaveLength(36);
    });

    test('Shouldn`t create with blank id', async () => {
      const block = await new BlockEntity().save();
      const section = Object.assign(
        new SectionEntity(),
        {id: '', block},
      );

      await expect(section.save()).rejects.toThrow('not_empty_id');
    });

    test('Should get empty list', async () => {
      const repo = source.getRepository(SectionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create with parent', async () => {
      const repo = source.getRepository(SectionEntity);

      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new SectionEntity(),
        {id: 'PARENT', block},
      ).save();
      await Object.assign(
        new SectionEntity(),
        {id: 'CHILD', block, parent},
      ).save();

      const inst = await repo.findOne({
        where: {id: 'CHILD'},
        relations: {parent: true},
      });

      expect(inst.parent.id).toBe('PARENT');
    });

    test('Should create with children', async () => {
      const repo = source.getRepository(SectionEntity);

      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new SectionEntity(),
        {id: 'PARENT', block},
      ).save();
      await Object.assign(
        new SectionEntity(),
        {id: 'CHILD', block, parent},
      ).save();

      const inst = await repo.findOne({
        where: {id: 'PARENT'},
        relations: {children: true},
      });

      expect(inst.children).toHaveLength(1);
      expect(inst.children[0].id).toBe('CHILD');
    });
  });
});