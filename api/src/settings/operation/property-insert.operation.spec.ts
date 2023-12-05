import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { PropertyInsertOperation } from './property-insert.operation';

describe('Property insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Flag insert', () => {
    test('Should save', async () => {
      const id = await new PropertyInsertOperation(source.manager).save({
        id: 'NEW',
        property: [],
        flag: [],
      });

      expect(id).toBe('NEW');
    });
  });
})