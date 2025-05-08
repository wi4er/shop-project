import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { PermissionMethod, RegistryEntity, RegistryPermissionEntity } from './registry-permission.entity';

describe('Registry registry-permission entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Registry registry-permission fields', () => {
    test('Should create item', async () => {
      const item = new RegistryPermissionEntity();

      item.entity = RegistryEntity.DIRECTORY;
      item.method = PermissionMethod.GET;

      await item.save();
    });
  });
});