import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { Contact4stringEntity } from './contact4string.entity';
import { ContactEntity, UserContactType } from './contact.entity';
import { PropertyEntity } from '../../settings/model/property.entity';

describe('Contact string property entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Contact string fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Contact4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create instance', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(
        new ContactEntity(),
        {id: 'mail', type: UserContactType.EMAIL},
      ).save();

      const inst = await Object.assign(new Contact4stringEntity(), {string: 'VALUE', parent, property}).save();

      expect(inst.version).toBe(1);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Contact4stringEntity(), {string: 'VALUE', property}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const parent = await Object.assign(
        new ContactEntity(),
        {id: 'mail', type: UserContactType.EMAIL},
      ).save();

      await expect(
        Object.assign(new Contact4stringEntity(), {string: 'VALUE', parent}).save(),
      ).rejects.toThrow('propertyId');
    });
  });

  describe('Contact with strings', () => {
    test('Should create contact with string', async () => {
      const repo = source.getRepository(ContactEntity);
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(
        new ContactEntity(),
        {id: 'NAME', type: UserContactType.EMAIL},
      ).save();

      await Object.assign(new Contact4stringEntity(), {string: 'VALUE', parent, property}).save();

      const inst = await repo.findOne({
        where: {id: 'NAME'},
        relations: {string: {property: true}},
      });

      expect(inst.string).toHaveLength(1);
      expect(inst.string[0].string).toBe('VALUE');
      expect(inst.string[0].property.id).toBe('NAME');
    });
  });
});