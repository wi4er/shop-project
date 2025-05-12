import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Access2permissionEntity } from './access2permission.entity';

describe('Registry access access entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Registry access fields', () => {
    test('Should get list', async () => {
      const repo = source.getRepository(Access2permissionEntity);

      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});