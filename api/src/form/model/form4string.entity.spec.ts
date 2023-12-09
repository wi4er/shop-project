import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FormEntity } from './form.entity';
import { Form4stringEntity } from './form4string.entity';
import { PropertyEntity } from '../../settings/model/property.entity';

describe('Form string property entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Form sting fields', () => {
    test('Should create property property', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();

      const value = new Form4stringEntity();
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

    test('Should get form string', async () => {
      const repo = source.getRepository(Form4stringEntity);

      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();
      await Object.assign(new Form4stringEntity(), {string: 'VALUE', parent, property}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {property: true},
      });
      expect(inst.id).toBe(1);
      expect(inst.string).toBe('VALUE');
      expect(inst.property.id).toBe('PROPERTY');
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();

      const value = new Form4stringEntity();
      value.string = 'VALUE';
      value.property = property;
      await expect(value.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();

      const value = new Form4stringEntity();
      value.string = 'VALUE';
      value.parent = parent;
      await expect(value.save()).rejects.toThrow('propertyId');
    });
  });

  describe('Form with string', () => {
    test('Should add form with string', async () => {
      const repo = source.getRepository(FormEntity);

      const property = await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();
      const parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      await Object.assign(new Form4stringEntity(), {string: 'VALUE', property, parent}).save();

      const item = await repo.findOne({
        where: {id: 'FORM'},
        relations: {string: {property: true}},
      });

      expect(item.string).toHaveLength(1);
      expect(item.string[0].string).toBe('VALUE');
      expect(item.string[0].property.id).toBe('PROPERTY');
    });
  });
});