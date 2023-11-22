import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { PropertyEntity } from './property.entity';
import { Property2stringEntity } from './property2string.entity';
import { createConnectionOptions } from '../../createConnectionOptions';

describe('Property2string entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Property2sting fields', () => {
    test('Should create property property', async () => {
      const parent = await Object.assign(new PropertyEntity(), {id: 'PARENT'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();

      const value = new Property2stringEntity();
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

    test('Should get property string', async () => {
      const parent = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const repo = source.getRepository(Property2stringEntity);
      await Object.assign(new Property2stringEntity(), {string: 'VALUE', parent, property: parent}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {property: true},
      });
      expect(inst.id).toBe(1);
      expect(inst.string).toBe('VALUE');
      expect(inst.property.id).toBe('NAME');
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();

      const value = new Property2stringEntity();
      value.string = 'VALUE';
      value.property = property;
      await expect(value.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const parent = await Object.assign(new PropertyEntity(), {id: 'PARENT'}).save();

      const value = new Property2stringEntity();
      value.string = 'VALUE';
      value.parent = parent;
      await expect(value.save()).rejects.toThrow('propertyId');
    });
  });

  describe('Property with string', () => {
    test('Should add property with string', async () => {
      const repo = source.getRepository(PropertyEntity);

      const property = await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();
      const parent = await Object.assign(new PropertyEntity(), {id: 'PARENT'}).save();
      await Object.assign(new Property2stringEntity(), {string: 'VALUE', property, parent}).save();

      const item = await repo.findOne({
        where: {id: 'PARENT'},
        relations: {string: {property: true}},
      });

      expect(item.string).toHaveLength(1);
      expect(item.string[0].string).toBe('VALUE');
      expect(item.string[0].property.id).toBe('PROPERTY');
    });

    test('Should add property with property id', async () => {
      const repo = source.getRepository(PropertyEntity);

      await Object.assign(new PropertyEntity(), {id: 'VALUE'}).save();
      await Object.assign(new PropertyEntity(), {id: 'PROPERTY'}).save();
      await Object.assign(new Property2stringEntity(), {string: 'VALUE', property: 'VALUE', parent: 'PROPERTY'}).save();

      const item = await repo.findOne({where: {id: 'PROPERTY'}, relations: {string: true}});

      expect(item.string[0].string).toBe('VALUE');
    });
  });
});