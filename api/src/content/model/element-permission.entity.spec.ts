import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { ElementPermissionEntity } from './element-permission.entity';

describe('Element permission entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element permission fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(ElementPermissionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});