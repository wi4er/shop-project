import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { UserEntity } from '../model/user.entity';
import { UserGroupEntity } from '../model/user-group.entity';
import { User2userGroupInsertOperation } from './user2user-group-insert.operation';

describe('User 2 group insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  describe('User fields', () => {
    test('Should add group to user', async () => {
      const repo = source.getRepository(UserEntity);
      await Object.assign(new UserEntity(), {login: 'user'}).save();
      await new UserGroupEntity().save();

      await new User2userGroupInsertOperation(source.manager).save(
        await repo.findOne({where: {id: 1}}),
        {
          id: 1,
          login: 'user',
          group: [1],
          contact: [],
          property: [],
          flag: [],
        },
      );

      const user = await repo.findOne({
        where: {id: 1},
        relations: {group: true},
      });

      expect(user.group).toHaveLength(1);
      expect(user.group[0].id).toBe(1);
    });
  });
});