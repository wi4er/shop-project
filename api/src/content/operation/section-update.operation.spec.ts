import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { SectionUpdateOperation } from './section-update.operation';
import { SectionEntity } from '../model/section.entity';
import { BlockEntity } from '../model/block.entity';

describe('Section update operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Section update', () => {
    test('Should save', async () => {
      const block = await new BlockEntity().save();
      await Object.assign(new SectionEntity(), {block}).save();

      const id = await new SectionUpdateOperation(source.manager).save(1, {
        block: block.id,
        parent: null,
        flag: [],
        property: [],
      });

      expect(id).toBe(1);
    });
  });
});