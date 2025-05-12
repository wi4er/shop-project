import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { GroupEntity } from './group.entity';
import { Group2flagEntity } from './group2flag.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';

describe('UserGroup 2 flag entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('UserGroup2flag fields', () => {
    test('Should create user contact flag', async () => {
      const parent = await new GroupEntity().save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = new Group2flagEntity();
      inst.parent = parent;
      inst.flag = flag;

      await inst.save();

      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Shouldn`t create without flag', async () => {
      const parent = await new GroupEntity().save();
      const inst = new Group2flagEntity();
      inst.parent = parent;

      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t create without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = new Group2flagEntity();
      inst.flag = flag;

      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });

  describe('User group with flag', () => {
    test('Should create user contact with flag', async () => {
      const repo = source.getRepository(GroupEntity);

      const parent = await await Object.assign(new GroupEntity(), {id: '222'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Group2flagEntity(), {parent, flag}).save();

      const inst = await repo.findOne({where: {id: '222'}, relations: {flag: {flag: true}}});

      expect(inst.flag).toHaveLength(1);
      expect(inst.flag[0].id).toBe(1);
      expect(inst.flag[0].flag.id).toBe('ACTIVE');
    });

    test('Shouldn`t create duplicate flag', async () => {
      const parent = await new GroupEntity().save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Group2flagEntity(), {parent, flag}).save();
      await expect(
        Object.assign(new Group2flagEntity(), {parent, flag}).save(),
      ).rejects.toThrow('duplicate key');
    });
  });
});