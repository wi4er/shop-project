import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Element4IntervalEntity } from './element4interval.entity';

describe('ElementEntity for interval entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('ElementEntity for interval fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Element4IntervalEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

  });
});