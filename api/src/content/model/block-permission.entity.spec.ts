import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockPermissionEntity } from './block-permission.entity';
import { BlockEntity } from './block.entity';
import { GroupEntity } from '../../personal/model/group.entity';
import { PermissionMethod } from '../../permission/model/permission-method';

describe('Block permission entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Block permission fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(BlockPermissionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create instance', async () => {
      const inst = new BlockPermissionEntity();

      inst.group = await new GroupEntity().save();
      inst.block = await new BlockEntity().save();
      inst.method = PermissionMethod.ALL;

      await inst.save();

      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Should get item', async () => {
      const repo = source.getRepository(BlockPermissionEntity);
      await Object.assign(
        new BlockPermissionEntity(),
        {
          group: await new GroupEntity().save(),
          block: await new BlockEntity().save(),
          method: PermissionMethod.ALL,
        }
      ).save();

      const item = await repo.findOne({
        where: {id: 1},
        relations: {
          block: true,
          group: true,
        }
      });

      expect(item.block.id).toBe(1)
      expect(item.group.id).toBe(1)
    });
  });
});