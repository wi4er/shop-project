import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { DocumentEntity } from '../model/document.entity';
import { DocumentDeleteOperation } from './document-delete.operation';

describe('Document delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Block delete', () => {
    test('Should delete', async () => {
      const block = await new DocumentEntity().save();

      const id = await new DocumentDeleteOperation(source.manager).save([1]);

      expect(id).toEqual([1]);
    });
  });
});