import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Element4InstanceEntity } from './element4instance.entity';

describe('Element instance attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element instance fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Element4InstanceEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });
});