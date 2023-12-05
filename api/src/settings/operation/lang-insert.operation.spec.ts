import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { LangInsertOperation } from './lang-insert.operation';

describe('Lang insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Lang insert', () => {
    test('Should save', async () => {
      const id = await new LangInsertOperation(source.manager).save({
        id: 'GR',
        property: [],
        flag: [],
      });

      expect(id).toBe('GR');
    });
  });
})