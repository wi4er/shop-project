import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FormEntity } from './form.entity';

describe('Form entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Form fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(FormEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should add item', async () => {
      const inst = new FormEntity();
      inst.id = 'NAME';

      await inst.save();

      expect(inst.id).toBe('NAME');
      expect(inst.sort).toBe(100);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Shouldn`t add with blank id', async () => {
      const inst = new FormEntity();
      inst.id = '';

      await expect(inst.save()).rejects.toThrow();
    });

    test('Should get single element list', async () => {
      await Object.assign(new FormEntity(), {id: 'NAME'}).save();

      const repo = source.getRepository(FormEntity);
      const list = await repo.find();

      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('NAME');
    });
  });
});