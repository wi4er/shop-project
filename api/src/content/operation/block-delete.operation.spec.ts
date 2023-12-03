import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from '../model/block.entity';
import { BlockDeleteOperation } from './block-delete.operation';

describe('Block delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Block delete', () => {
    test('Should delete', async () => {
      const block = await new BlockEntity().save();

      const id = await new BlockDeleteOperation(source.manager).save([1]);

      expect(id).toEqual([1]);
    });
  });
});