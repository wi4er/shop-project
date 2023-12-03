import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from '../model/block.entity';
import { BlockUpdateOperation } from './block-update.operation';

describe('Block update operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Block update', () => {
    test('Should save', async () => {
      const block = await new BlockEntity().save();

      const id = await new BlockUpdateOperation(source.manager).save(1, {
        property: [],
        flag: [],
      });

      expect(id).toBe(1);
    });
  });
});