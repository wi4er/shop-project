import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Contact4stringEntity } from './contact4string.entity';
import { ContactEntity, UserContactType } from './contact.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

describe('ContactEntity string attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('ContactEntity string fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Contact4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create instance', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(
        new ContactEntity(),
        {id: 'mail', type: UserContactType.EMAIL},
      ).save();

      const inst = await Object.assign(new Contact4stringEntity(), {string: 'VALUE', parent, attribute}).save();

      expect(inst.version).toBe(1);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Contact4stringEntity(), {string: 'VALUE', property}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const parent = await Object.assign(
        new ContactEntity(),
        {id: 'mail', type: UserContactType.EMAIL},
      ).save();

      await expect(
        Object.assign(new Contact4stringEntity(), {string: 'VALUE', parent}).save(),
      ).rejects.toThrow('attributeId');
    });
  });

  describe('ContactEntity with strings', () => {
    test('Should create contact with string', async () => {
      const repo = source.getRepository(ContactEntity);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(
        new ContactEntity(),
        {id: 'NAME', type: UserContactType.EMAIL},
      ).save();

      await Object.assign(new Contact4stringEntity(), {string: 'VALUE', parent, attribute}).save();

      const inst = await repo.findOne({
        where: {id: 'NAME'},
        relations: {string: {attribute: true}},
      });

      expect(inst.string).toHaveLength(1);
      expect(inst.string[0].string).toBe('VALUE');
      expect(inst.string[0].attribute.id).toBe('NAME');
    });
  });
});