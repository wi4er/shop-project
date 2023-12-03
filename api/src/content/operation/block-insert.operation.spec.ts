import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockInsertOperation } from './block-insert.operation';

describe('Block insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Block insert', () => {
    test('Should save', async () => {

      const id = await new BlockInsertOperation(source.manager).save({
        property: [],
        flag: [],
      });

      expect(id).toBe(1);
    });
  });
});