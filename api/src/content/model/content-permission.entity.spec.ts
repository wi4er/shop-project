import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { ContentPermissionEntity } from './content-permission.entity';
import { GroupEntity } from '../../personal/model/group.entity';
import { BlockEntity } from './block.entity';

describe('Content registry-permission entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Content registry-permission fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(ContentPermissionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});