import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { GroupEntity } from './group.entity';
import { UserEntity } from './user.entity';
import { User2groupEntity } from './user2group.entity';

describe('User to Group entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('User2UserGroup fields', () => {
    test('Should create', async () => {
      const parent = await Object.assign(new UserEntity(), {login: 'user'}).save();
      const group = await Object.assign(new GroupEntity(), {}).save();
      const inst = await Object.assign(
        new User2groupEntity(),
        {parent, group},
      ).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create duplicate', async () => {
      const parent = await Object.assign(new UserEntity(), {login: 'user'}).save();
      const group = await Object.assign(new GroupEntity(), {}).save();
      await Object.assign(new User2groupEntity(),{parent, group}).save();
      await expect(
        Object.assign(new User2groupEntity(),{parent, group}).save()
      ).rejects.toThrow('duplicate');
    });
  });

  describe('User groups field', () => {
    test('Should create user with group', async () => {
      const repo = source.getRepository(UserEntity);

      const parent = await Object.assign(new UserEntity(), {login: 'user'}).save();
      const group = await Object.assign(new GroupEntity(), {}).save();
      await Object.assign(new User2groupEntity(), {parent, group}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {group: {group: true}},
      });

      expect(inst.group).toHaveLength(1);
      expect(inst.group[0].group.id).toBe(1);
    });
  });

  describe('User with groups', () => {
    test('Should create user with group', async () => {
      const repo = source.getRepository(UserEntity);

      const parent = await Object.assign(new UserEntity(), {login: 'user'}).save();
      const group = await Object.assign(new GroupEntity(), {}).save();
      await Object.assign(new User2groupEntity(), {parent, group}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {group: {group: true}},
      });

      expect(inst.group).toHaveLength(1);
      expect(inst.group[0].group.id).toBe(1);
    });
  });
});
