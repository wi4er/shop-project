import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { DirectoryEntity } from '../model/directory.entity';
import { DirectoryInsertOperation } from './directory-insert.operation';

describe('Directory insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Directory insert', () => {
    test('Should save', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      const id = await new DirectoryInsertOperation(source.manager).save({
        id: 'CITY',
        property: [],
        flag: [],
      });

      expect(id).toBe('CITY');
    });
  });
});