import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { Section2permissionEntity } from './section2permission.entity';
import { SectionEntity } from './section.entity';
import { GroupEntity } from '../../personal/model/group.entity';
import { BlockEntity } from './block.entity';
import { PermissionMethod } from '../../permission/model/permission-method';

describe('Section permission entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Section permission fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Section2permissionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should add permission', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const group = await Object.assign(new GroupEntity(), {}).save();

      await Object.assign(new Section2permissionEntity(), {parent, group, method: PermissionMethod.ALL}).save();
    });

    test('Shouldn`t add duplicate', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const group = await Object.assign(new GroupEntity(), {}).save();

      await Object.assign(new Section2permissionEntity(), {parent, group, method: PermissionMethod.ALL}).save();
      await expect(
        Object.assign(new Section2permissionEntity(), {parent, group, method: PermissionMethod.ALL}).save()
      ).rejects.toThrow('duplicate');
    });

    test('Shouldn`t add without parent', async () => {
      const group = await Object.assign(new GroupEntity(), {}).save();

      await expect(
        Object.assign(new Section2permissionEntity(), {group, method: PermissionMethod.ALL}).save()
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t add without method', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const group = await Object.assign(new GroupEntity(), {}).save();

      await expect(
        Object.assign(new Section2permissionEntity(), {parent, group}).save()
      ).rejects.toThrow('method');
    });
  });
});