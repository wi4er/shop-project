import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from '../model/block.entity';
import { SectionInsertOperation } from './section-insert.operation';

describe('Section insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Section insert', () => {
    test('Should save', async () => {
      const block = await new BlockEntity().save();

      const id = await new SectionInsertOperation(source.manager).save({
        block: block.id,
        property: [],
        flag: [],
      });

      expect(id).toBe(1);
    });
  });
});