import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FormEntity } from './form.entity';
import { FormFieldEntity } from './form-field.entity';
import { FormField4stringEntity } from './form-field4string.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';

describe('Form field string attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Form field sting fields', () => {
    test('Should create field attribute', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const parent = await Object.assign(new FormFieldEntity(), {id: 'FIELD', form}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'PROPERTY'}).save();

      const value = new FormField4stringEntity();
      value.string = 'VALUE';
      value.attribute = attribute;
      value.parent = parent;
      const inst = await value.save();

      expect(inst.id).toBe(1);
      expect(inst.string).toBe('VALUE');
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Should get field string', async () => {
      const repo = source.getRepository(FormField4stringEntity);

      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const parent = await Object.assign(new FormFieldEntity(), {id: 'FIELD', form}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'PROPERTY'}).save();
      await Object.assign(new FormField4stringEntity(), {string: 'VALUE', parent, attribute}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {attribute: true, parent: true},
      });

      expect(inst.id).toBe(1);
      expect(inst.string).toBe('VALUE');
      expect(inst.attribute.id).toBe('PROPERTY');
      expect(inst.parent.id).toBe('FIELD');
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'PROPERTY'}).save();

      const value = new FormField4stringEntity();
      value.string = 'VALUE';
      value.attribute = attribute;
      await expect(value.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const parent = await Object.assign(new FormFieldEntity(), {id: 'FIELD', form}).save();

      const value = new FormField4stringEntity();
      value.string = 'VALUE';
      value.parent = parent;
      await expect(value.save()).rejects.toThrow('attributeId');
    });
  });

  describe('Field with string', () => {
    test('Should add field with string', async () => {
      const repo = source.getRepository(FormFieldEntity);

      const attribute = await Object.assign(new AttributeEntity(), {id: 'PROPERTY'}).save();
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const parent = await Object.assign(new FormFieldEntity(), {id: 'FIELD', form}).save();
      await Object.assign(new FormField4stringEntity(), {string: 'VALUE', attribute, parent}).save();

      const item = await repo.findOne({
        where: {id: 'FIELD'},
        relations: {string: {attribute: true}},
      });

      expect(item.string).toHaveLength(1);
      expect(item.string[0].string).toBe('VALUE');
      expect(item.string[0].attribute.id).toBe('PROPERTY');
    });
  });
});