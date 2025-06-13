import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { InstanceEntity } from './instance.entity';

describe('Instance entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Instance fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(InstanceEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});