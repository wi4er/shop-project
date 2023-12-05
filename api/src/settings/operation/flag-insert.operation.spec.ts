import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from '../../content/model/block.entity';
import { ElementInsertOperation } from '../../content/operation/element-insert.operation';
import { FlagInsertOperation } from './flag-insert.operation';

describe('Flag insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Flag insert', () => {
    test('Should save', async () => {
      const id = await new FlagInsertOperation(source.manager).save({
        id: 'NEW',
        property: [],
        flag: [],
      });

      expect(id).toBe('NEW');
    });
  });
})