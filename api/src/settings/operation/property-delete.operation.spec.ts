import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { PropertyDeleteOperation } from './property-delete.operation';
import { PropertyEntity } from '../model/property.entity';

describe('Property delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Property delete', () => {
    test('Should delete', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NEW'}).save();

      const id = await new PropertyDeleteOperation(source.manager).save(['NEW']);

      expect(id).toEqual(['NEW']);
    });
  });
});