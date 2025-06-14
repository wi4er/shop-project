import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Block2permissionEntity } from './block2permission.entity';
import { BlockEntity } from './block.entity';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';

describe('BlockEntity access entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('BlockEntity access fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Block2permissionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create instance', async () => {
      const inst = new Block2permissionEntity();

      inst.group = await new GroupEntity().save();
      inst.parent = await new BlockEntity().save();
      inst.method = PermissionMethod.ALL;

      await inst.save();

      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Shouldn`t create duplicate', async () => {
      const group = await new GroupEntity().save();
      const parent = await new BlockEntity('BLOCK').save();

      await Object.assign(
        new Block2permissionEntity(),
        {group, parent, method: PermissionMethod.ALL},
      ).save();

      await expect(Object.assign(
        new Block2permissionEntity(),
        {group, parent, method: PermissionMethod.ALL},
      ).save()).rejects.toThrow('duplicate');
    });

    test('Should get item', async () => {
      const repo = source.getRepository(Block2permissionEntity);
      await Object.assign(
        new Block2permissionEntity(),
        {
          group: await Object.assign(new GroupEntity(), {id: 'GROUP'}).save(),
          parent: await new BlockEntity('BLOCK').save(),
          method: PermissionMethod.ALL,
        },
      ).save();

      const item = await repo.findOne({
        where: {id: 1},
        relations: {
          parent: true,
          group: true,
        },
      });

      expect(item.parent.id).toBe('BLOCK');
      expect(item.group.id).toBe('GROUP');
    });

    test('Shouldn`t create without parent', async () => {
      const inst = new Block2permissionEntity();

      inst.group = await new GroupEntity().save();
      inst.method = PermissionMethod.ALL;

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without method', async () => {
      const inst = new Block2permissionEntity();

      inst.parent = await new BlockEntity().save();
      inst.group = await new GroupEntity().save();

      await expect(inst.save()).rejects.toThrow('method');
    });
  });
});