import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from '../model/block.entity';
import { ElementEntity } from '../model/element.entity';
import { ElementDeleteOperation } from './element-delete.operation';

describe('Element delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element delete', () => {
    test('Should delete', async () => {
      const block = await new BlockEntity().save();
      await Object.assign(new ElementEntity(), {block}).save();

      const id = await new ElementDeleteOperation(source.manager).save([1]);

      expect(id).toEqual([1]);
    });
  });
});