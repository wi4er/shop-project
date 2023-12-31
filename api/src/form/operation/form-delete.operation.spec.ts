import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FormDeleteOperation } from './form-delete.operation';
import { FormEntity } from '../model/form.entity';

describe('Form delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Form delete', () => {
    test('Should delete', async () => {
      await Object.assign(new FormEntity(), {id: 'LEAD'}).save();

      const id = await new FormDeleteOperation(source.manager).save(['LEAD']);

      expect(id).toEqual(['LEAD']);
    });
  });
});