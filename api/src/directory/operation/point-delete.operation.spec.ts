import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { DirectoryEntity } from '../model/directory.entity';
import { PointDeleteOperation } from './point-delete.operation';
import { PointEntity } from '../model/point.entity';

describe('Point delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Directory delete', () => {
    test('Should delete', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'London', directory}).save();

      const id = await new PointDeleteOperation(source.manager).save(['London']);

      expect(id).toEqual(['London']);
    });
  });
});