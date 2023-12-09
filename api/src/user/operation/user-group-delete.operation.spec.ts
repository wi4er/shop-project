import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { UserGroupDeleteOperation } from './user-group-delete.operation';
import { UserGroupEntity } from '../model/user-group.entity';

describe('Group delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Group delete', () => {
    test('Should delete', async () => {
      await Object.assign(new UserGroupEntity(), {}).save();
      const id = await new UserGroupDeleteOperation(source.manager).save([1]);

      expect(id).toEqual([1]);
    });
  });
});