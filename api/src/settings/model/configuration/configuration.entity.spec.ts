import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { ConfigurationEntity } from './configuration.entity';

describe('Configuration entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Configuration fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(ConfigurationEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should add item', async () => {
      const inst = new ConfigurationEntity();
      inst.id = 'DEFAULT_NAME';
      inst.value = 'NAME';

      await inst.save();
    })
  });
});