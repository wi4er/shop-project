import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from '../model/block.entity';
import { ElementInsertOperation } from './element-insert.operation';

describe('Element insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element insert', () => {
    test('Should save', async () => {
      const block = await new BlockEntity().save();

      const id = await new ElementInsertOperation(source.manager).save({
        block: block.id,
        property: [],
        flag: [],
      });

      expect(id).toBe(1);
    });
  });
});