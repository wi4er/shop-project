import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FormInsertOperation } from './form-insert.operation';

describe('Form insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Form insert', () => {
    test('Should save', async () => {

      const id = await new FormInsertOperation(source.manager).save({
        id: 'ORDER',
        property: [],
        flag: [],
      });

      expect(id).toBe('ORDER');
    });
  });
});