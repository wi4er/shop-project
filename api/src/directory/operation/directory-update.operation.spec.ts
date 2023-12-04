import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { DirectoryEntity } from '../model/directory.entity';
import { DirectoryUpdateOperation } from './directory-update.operation';

describe('Directory update operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Directory update', () => {
    test('Should save', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      const id = await new DirectoryUpdateOperation(source.manager).save('CITY', {
        id: 'CITY',
        property: [],
        flag: [],
      });

      expect(id).toBe('CITY');
    });
  });
});