import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { SectionEntity } from './section.entity';
import { BlockEntity } from './block.entity';

describe('Section entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Section fields', () => {
    test('Should create section', async () => {
      const block = await new BlockEntity().save();
      const section = await Object.assign(new SectionEntity(), {block}).save();

      expect(section.id).toBe(1);
      expect(section.created_at).toBeDefined();
      expect(section.updated_at).toBeDefined();
      expect(section.deleted_at).toBeNull();
      expect(section.version).toBe(1);
    });

    test('Should get empty list', async () => {
      const repo = source.getRepository(SectionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create with parent', async () => {
      const repo = source.getRepository(SectionEntity);

      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      await Object.assign(new SectionEntity(), {block, parent}).save();

      const inst = await repo.findOne({
        where: {id: 2},
        relations: {parent: true},
      });

      expect(inst.parent.id).toBe(1);
    });

    test('Should create with children', async () => {
      const repo = source.getRepository(SectionEntity);

      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      await Object.assign(new SectionEntity(), {block, parent}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {children: true},
      });

      expect(inst.children).toHaveLength(1);
      expect(inst.children[0].id).toBe(2);
    });
  });
});