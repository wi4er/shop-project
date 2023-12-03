import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FormEntity } from './form.entity';
import { FormFieldEntity } from './form-field.entity';
import { FormField2stringEntity } from './form-field2string.entity';
import { PropertyEntity } from '../../settings/model/property.entity';

describe('FormField2string entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('FormField2sting fields', () => {
    test('Should create field property', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const parent = await Object.assign(new FormFieldEntity(), {id: 'FIELD', form}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();

      const value = new FormField2stringEntity();
      value.string = 'VALUE';
      value.property = property;
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
      const repo = source.getRepository(FormField2stringEntity);

      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const parent = await Object.assign(new FormFieldEntity(), {id: 'FIELD', form}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();
      await Object.assign(new FormField2stringEntity(), {string: 'VALUE', parent, property}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {property: true, parent: true},
      });

      expect(inst.id).toBe(1);
      expect(inst.string).toBe('VALUE');
      expect(inst.property.id).toBe('PROPERTY');
      expect(inst.parent.id).toBe('FIELD');
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();

      const value = new FormField2stringEntity();
      value.string = 'VALUE';
      value.property = property;
      await expect(value.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const parent = await Object.assign(new FormFieldEntity(), {id: 'FIELD', form}).save();

      const value = new FormField2stringEntity();
      value.string = 'VALUE';
      value.parent = parent;
      await expect(value.save()).rejects.toThrow('propertyId');
    });
  });

  describe('Field with string', () => {
    test('Should add field with string', async () => {
      const repo = source.getRepository(FormFieldEntity);

      const property = await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const parent = await Object.assign(new FormFieldEntity(), {id: 'FIELD', form}).save();
      await Object.assign(new FormField2stringEntity(), {string: 'VALUE', property, parent}).save();

      const item = await repo.findOne({
        where: {id: 'FIELD'},
        relations: {string: {property: true}},
      });

      expect(item.string).toHaveLength(1);
      expect(item.string[0].string).toBe('VALUE');
      expect(item.string[0].property.id).toBe('PROPERTY');
    });
  });
});