import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Block4descriptionEntity } from './block4description.entity';

describe('BlockEntity description entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('BlockEntity description fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Block4descriptionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});