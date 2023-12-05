import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FlagUpdateOperation } from './flag-update.operation';
import { FlagEntity } from '../model/flag.entity';

describe('Flag update operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Flag update', () => {
    test('Should save', async () => {
      await Object.assign(new FlagEntity(), {id: 'NEW'}).save();

      const id = await new FlagUpdateOperation(source.manager).save('NEW', {
        id: 'NEW',
        flag: [],
        property: [],
      });

      expect(id).toBe('NEW');
    });
  });
});