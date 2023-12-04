import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { DocumentInsertOperation } from './document-insert.operation';

describe('Document insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Document insert', () => {
    test('Should save', async () => {
      const id = await new DocumentInsertOperation(source.manager).save({
        property: [],
        flag: [],
      });

      expect(id).toBe(1);
    });
  });
});