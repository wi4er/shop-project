import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Field4stringEntity } from './field4string.entity';

describe('Field for string entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Field4string fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Field4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});