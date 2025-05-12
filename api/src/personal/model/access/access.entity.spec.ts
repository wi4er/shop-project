import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AccessEntity } from './access.entity';
import { AccessTarget } from './access-target';
import { AccessMethod } from './access-method';

describe('Registry access entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Registry access fields', () => {
    test('Should create item', async () => {
      const item = new AccessEntity();

      item.target = AccessTarget.DIRECTORY;
      item.method = AccessMethod.GET;

      await item.save();
    });
  });
});