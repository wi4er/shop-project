import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Directory2permissionEntity } from './directory2permission.entity';

describe('Directory to access entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Directory access fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Directory2permissionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});