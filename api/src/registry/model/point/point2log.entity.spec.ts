import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { DirectoryEntity } from '../directory/directory.entity';
import { Point2logEntity } from './point2log.entity';
import { PointEntity } from './point.entity';

describe('Point to registry-log entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Point registry-log fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Point2logEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should add item', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const inst = new Point2logEntity();

      inst.parent = parent;
      inst.field = 'attribute.NAME';
      inst.operation = 'CHANGE';
      inst.from = 'OLD';
      inst.to = 'NEW';

      await inst.save();
    });
  });
});