import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { AttributeEntity } from './attribute.entity';
import { Attribute4stringEntity } from './attribute4string.entity';
import { createConnectionOptions } from '../../createConnectionOptions';

describe('Attribute2string entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Attribute2sting fields', () => {
    test('Should create attribute attribute', async () => {
      const parent = await Object.assign(new AttributeEntity(), {id: 'PARENT'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'ATTRIBUTE'}).save();

      const value = new Attribute4stringEntity();
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

    test('Should get attribute string', async () => {
      const parent = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const repo = source.getRepository(Attribute4stringEntity);
      await Object.assign(new Attribute4stringEntity(), {string: 'VALUE', parent, attribute: parent}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {attribute: true},
      });
      expect(inst.id).toBe(1);
      expect(inst.string).toBe('VALUE');
      expect(inst.attribute.id).toBe('NAME');
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'ATTRIBUTE'}).save();

      const value = new Attribute4stringEntity();
      value.string = 'VALUE';
      value.attribute = attribute;
      await expect(value.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const parent = await Object.assign(new AttributeEntity(), {id: 'PARENT'}).save();

      const value = new Attribute4stringEntity();
      value.string = 'VALUE';
      value.parent = parent;
      await expect(value.save()).rejects.toThrow('attributeId');
    });
  });

  describe('AttributeEntity with string', () => {
    test('Should add attribute with string', async () => {
      const repo = source.getRepository(AttributeEntity);

      const attribute = await Object.assign(new AttributeEntity(), {id: 'ATTRIBUTE'}).save();
      const parent = await Object.assign(new AttributeEntity(), {id: 'PARENT'}).save();
      await Object.assign(new Attribute4stringEntity(), {string: 'VALUE', attribute, parent}).save();

      const item = await repo.findOne({
        where: {id: 'PARENT'},
        relations: {string: {attribute: true}},
      });

      expect(item.string).toHaveLength(1);
      expect(item.string[0].string).toBe('VALUE');
      expect(item.string[0].attribute.id).toBe('ATTRIBUTE');
    });

    test('Should add attribute with attribute id', async () => {
      const repo = source.getRepository(AttributeEntity);

      await Object.assign(new AttributeEntity(), {id: 'VALUE'}).save();
      await Object.assign(new AttributeEntity(), {id: 'ATTRIBUTE'}).save();
      await Object.assign(new Attribute4stringEntity(), {string: 'VALUE', attribute: 'VALUE', parent: 'ATTRIBUTE'}).save();

      const item = await repo.findOne({where: {id: 'ATTRIBUTE'}, relations: {string: true}});

      expect(item.string[0].string).toBe('VALUE');
    });
  });
});