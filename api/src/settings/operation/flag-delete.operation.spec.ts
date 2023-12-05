import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FlagDeleteOperation } from './flag-delete.operation';
import { FlagEntity } from '../model/flag.entity';

describe('Flag delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Flag delete', () => {
    test('Should delete', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const id = await new FlagDeleteOperation(source.manager).save(['NEW']);

      expect(id).toEqual(['NEW']);
    });
  });
});