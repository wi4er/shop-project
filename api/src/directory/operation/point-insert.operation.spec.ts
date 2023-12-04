import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { PointInsertOperation } from './point-insert.operation';
import { DirectoryEntity } from '../model/directory.entity';

describe('Point insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element insert', () => {
    test('Should save', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      const id = await new PointInsertOperation(source.manager).save({
        id: 'LONDON',
        directory: 'CITY',
        property: [],
        flag: [],
      });

      expect(id).toBe('LONDON');
    });
  });
});