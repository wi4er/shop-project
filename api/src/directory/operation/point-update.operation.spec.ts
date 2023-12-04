import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { DirectoryEntity } from '../model/directory.entity';
import { PointEntity } from '../model/point.entity';
import { PointUpdateOperation } from './point-update.operation';

describe('Point update operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Point update', () => {
    test('Should save', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new PointEntity(), {id: 'Paris', directory}).save();

      const id = await new PointUpdateOperation(source.manager).save('Paris', {
        id: 'Paris',
        directory: 'CITY',
        property: [],
        flag: [],
      });

      expect(id).toBe('Paris');
    });
  });
});