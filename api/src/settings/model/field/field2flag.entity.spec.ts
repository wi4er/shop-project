import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Field2flagEntity } from './field2flag.entity';

describe('Field to flag entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Field fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Field2flagEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});