import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { BlockEntity } from '../block/block.entity';
import { ElementEntity } from './element.entity';
import { Element4elementEntity } from './element4element.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

describe('Element4element entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('ElementElement fields', () => {
    test('Should create element value', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'PARENT', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const element = await Object.assign(new ElementEntity(), {id: 'CHILD', block}).save();

      const inst = await Object.assign(new Element4elementEntity(), {parent, attribute, element}).save();

      expect(inst.id).toBe(1);
    });

    test('Should get empty list', async () => {
      const repo = source.getRepository(Element4elementEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create without parent', async () => {
      const block = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const element = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();

      const inst = Object.assign(new Element4elementEntity(), {attribute, element});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'PARENT', block}).save();
      const element = await Object.assign(new ElementEntity(), {id: 'CHILD', block} ).save();

      const inst = Object.assign(new Element4elementEntity(), {parent, element});

      await expect(inst.save()).rejects.toThrow('attributeId');
    });

    test('Shouldn`t create without element', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const property = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();

      const inst = Object.assign(new Element4elementEntity(), {property, parent});

      await expect(inst.save()).rejects.toThrow('elementId');
    });
  });
});