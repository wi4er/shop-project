import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { DocumentEntity } from '../model/document.entity';
import { DocumentUpdateOperation } from './document-update.operation';

describe('Document update operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Block update', () => {
    test('Should save', async () => {
      const block = await new DocumentEntity().save();

      const id = await new DocumentUpdateOperation(source.manager).save(1, {
        property: [],
        flag: [],
      });

      expect(id).toBe(1);
    });
  });
});