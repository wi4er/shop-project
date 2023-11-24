import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { DocumentEntity } from './document.entity';

describe('Document entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Document fields', () => {
    test('Should create with id', async () => {
      const inst = await new DocumentEntity().save();

      expect(inst.id).toBe(1);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Should get empty list', async () => {
      const repo = source.getRepository(DocumentEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should get single element', async () => {
      await new DocumentEntity().save();

      const repo = source.getRepository(DocumentEntity);
      const item = await repo.findOne({where: {id: 1}});

      expect(item.id).toBe(1);
    });
  });
});