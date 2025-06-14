import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Directory2logEntity } from './directory2log.entity';
import { DirectoryEntity } from './directory.entity';

describe('DirectoryEntity to registry-log entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('DirectoryEntity registry-log fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Directory2logEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should add item', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const inst = new Directory2logEntity();

      inst.parent = parent;
      inst.field = 'attribute.NAME';
      inst.operation = 'CHANGE';
      inst.from = 'OLD';
      inst.to = 'NEW';

      await inst.save();
    });
  });
});