import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { SettingsPermissionEntity } from './settings-permission.entity';

describe('Settings permission', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('SettingsPermission fields', () => {
    test('Should create instance', async () => {
      const repo = source.getRepository(SettingsPermissionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});