import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from '../model/block.entity';
import { SectionDeleteOperation } from './section-delete.operation';
import { SectionEntity } from '../model/section.entity';

describe('Section delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Section delete', () => {
    test('Should delete', async () => {
      const block = await new BlockEntity().save();
      await Object.assign(new SectionEntity(), {block}).save();

      const id = await new SectionDeleteOperation(source.manager).save([1]);

      expect(id).toEqual([1]);
    });
  });
});