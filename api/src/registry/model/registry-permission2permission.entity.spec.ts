import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { RegistryPermission2permissionEntity } from './registry-permission2permission.entity';

describe('Registry registry-permission registry-permission entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Registry registry-permission fields', () => {
    test('Should get list', async () => {
      const repo = source.getRepository(RegistryPermission2permissionEntity);

      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});