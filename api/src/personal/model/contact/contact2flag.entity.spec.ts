import { DataSource } from "typeorm/data-source/DataSource";
import { createConnection } from "typeorm";
import { createConnectionOptions } from "../../../createConnectionOptions";
import { Contact2flagEntity } from "./contact2flag.entity";
import { ContactEntity, UserContactType } from "./contact.entity";
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('ContactEntity 2 flag entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  describe('UserContact2flag fields', () => {
    test('Should create personal contact flag', async () => {
      const parent = await Object.assign(new ContactEntity(), {
        id: 'EMAIL',
        type: UserContactType.EMAIL,
      }).save();
      const flag = await Object.assign(new FlagEntity(), { id: 'ACTIVE' }).save();

      const inst = new Contact2flagEntity();
      inst.parent = parent;
      inst.flag = flag;

      await inst.save();

      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Shouldn`t create without flag', async () => {
      const parent = await Object.assign(new ContactEntity(), {
        id: 'EMAIL',
        type: UserContactType.EMAIL,
      }).save();

      const inst = new Contact2flagEntity();
      inst.parent = parent;

      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t create without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), { id: 'ACTIVE' }).save();

      const inst = new Contact2flagEntity();
      inst.flag = flag;

      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });

  describe('UserEntity contact with flag', () => {
    test('Should create personal contact with flag', async () => {
      const repo = source.getRepository(ContactEntity);

      const parent = await Object.assign(new ContactEntity(), {
        id: 'EMAIL',
        type: UserContactType.EMAIL,
      }).save();
      const flag = await Object.assign(new FlagEntity(), { id: 'ACTIVE' }).save();
      await Object.assign(new Contact2flagEntity(), { parent, flag }).save();

      const inst = await repo.findOne({ where: { id: 'EMAIL' }, relations: { flag: { flag: true } } });

      expect(inst.flag).toHaveLength(1);
      expect(inst.flag[0].id).toBe(1);
      expect(inst.flag[0].flag.id).toBe('ACTIVE');
    });

    test('Shouldn`t create duplicate flag', async () => {
      const parent = await Object.assign(new ContactEntity(), {
        id: 'EMAIL',
        type: UserContactType.EMAIL,
      }).save();
      const flag = await Object.assign(new FlagEntity(), { id: 'ACTIVE' }).save();
      await Object.assign(new Contact2flagEntity(), { parent, flag }).save();

      await expect(
        Object.assign(new Contact2flagEntity(), { parent, flag }).save()
      ).rejects.toThrow('duplicate key');
    });
  });
});