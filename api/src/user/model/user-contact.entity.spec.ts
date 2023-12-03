import { DataSource } from "typeorm/data-source/DataSource";
import { createConnection } from "typeorm";
import { createConnectionOptions } from "../../createConnectionOptions";
import { UserContactEntity, UserContactType } from "./user-contact.entity";

describe('Contact entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Contact fields', () => {
    test('Should create', async () => {
      const inst = new UserContactEntity();
      inst.id = 'mail';
      inst.type = UserContactType.EMAIL;

      await inst.save();

      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
      expect(inst.type).toBe('EMAIL');
    });

    test('Shouldn`t create without id', async () => {
      const inst = new UserContactEntity();
      inst.type = UserContactType.EMAIL;

      await expect(inst.save()).rejects.toThrow('id');
    });

    test('Shouldn`t create with blank id', async () => {
      const inst = new UserContactEntity();
      inst.id = '';
      inst.type = UserContactType.EMAIL;

      await expect(inst.save()).rejects.toThrow('not_empty_id');
    });

    test('Shouldn`t create with wrong contact', async () => {
      const inst = Object.assign(
        new UserContactEntity(),
        {
          id: 'mail',
          type: 'SOME',
        }
      );

      await expect(inst.save()).rejects.toThrow('type');
    });

    test('Shouldn`t create without type', async () => {
      const inst = new UserContactEntity();
      inst.id = 'mail';

      await expect(inst.save()).rejects.toThrow();
    });
  });
});