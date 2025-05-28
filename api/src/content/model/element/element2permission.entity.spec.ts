import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Element2permissionEntity } from './element2permission.entity';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { BlockEntity } from '../block/block.entity';
import { ElementEntity } from './element.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';

describe('Element access entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element access fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Element2permissionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create instance', async () => {
      const group = await Object.assign(new GroupEntity(), {}).save();
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new ElementEntity(), {block}).save();

      await Object.assign(
        new Element2permissionEntity(),
        {parent, group, method: PermissionMethod.ALL},
      ).save();
    });

    test('Shouldn`t create duplicate instance', async () => {
      const group = await Object.assign(new GroupEntity(), {}).save();
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new ElementEntity(), {block}).save();

      await Object.assign(
        new Element2permissionEntity(),
        {parent, group, method: PermissionMethod.ALL},
      ).save();

      await expect(Object.assign(
        new Element2permissionEntity(),
        {parent, group, method: PermissionMethod.ALL},
      ).save()).rejects.toThrow('duplicate');
    });

    test('Should create without group', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new ElementEntity(), {block}).save();

      await Object.assign(
        new Element2permissionEntity(),
        {parent, method: PermissionMethod.ALL},
      ).save();
    });

    test('Shouldn`t create without parent', async () => {
      const group = await Object.assign(new GroupEntity(), {}).save();

      await expect(Object.assign(
        new Element2permissionEntity(),
        {group, method: PermissionMethod.ALL},
      ).save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without method', async () => {
      const group = await Object.assign(new GroupEntity(), {}).save();
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new ElementEntity(), {block}).save();

      await expect(Object.assign(
        new Element2permissionEntity(),
        {parent, group},
      ).save()).rejects.toThrow('method');
    });
  });
});