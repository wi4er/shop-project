import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FieldEntity } from './field.entity';

describe('Field entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Field fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(FieldEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});