import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { UserDeleteOperation } from './user-delete.operation';
import { UserEntity } from '../model/user.entity';

describe('User delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('User delete', () => {
    test('Should delete', async () => {
      await Object.assign(new UserEntity(), {login: 'user'}).save();
      const id = await new UserDeleteOperation(source.manager).save([1]);

      expect(id).toEqual([1]);
    });
  });
});