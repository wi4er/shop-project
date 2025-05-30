import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { GroupEntity } from './group.entity';

describe('UserGroup entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  describe('UserGroup fields', () => {
    test('Should create', async () => {
      const inst = new GroupEntity();

      await inst.save();

      expect(inst.id).toHaveLength(36);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });
  });

  describe('GroupEntity with parent', () => {
    test('Should create with parent', async () => {
      const repo = source.getRepository(GroupEntity);
      const parent = await new GroupEntity().save();

      const inst = new GroupEntity();
      inst.parent = parent;
      await inst.save();

      const some = await repo.findOne({where: {id: inst.id}, relations: {parent: true}});

      expect(some.parent.id).toBe(parent.id);
    });

    test('Should create with child', async () => {
      const repo = source.getRepository(GroupEntity);
      const parent = await new GroupEntity().save();

      const inst = new GroupEntity();
      inst.id = '222';
      inst.parent = parent;
      await inst.save();

      const some = await repo.findOne({where: {id: parent.id}, relations: {children: true}});

      expect(some.children).toHaveLength(1);
      expect(some.children[0].id).toBe('222');
    });
  });
});