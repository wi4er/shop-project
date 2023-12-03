import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { SectionPermissionEntity } from './section-permission.entity';

describe('Section permission entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Section permission fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(SectionPermissionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

  });
});