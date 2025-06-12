import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Element4CounterEntity } from './element4counter.entity';

describe('ElementEntity for counter entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('ElementEntity for counter fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Element4CounterEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});