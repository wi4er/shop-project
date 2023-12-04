import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { DirectoryEntity } from '../model/directory.entity';
import { DirectoryDeleteOperation } from './directory-delete.operation';

describe('Point delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Directory delete', () => {
    test('Should delete', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      const id = await new DirectoryDeleteOperation(source.manager).save(['CITY']);

      expect(id).toEqual(['CITY']);
    });
  });
});