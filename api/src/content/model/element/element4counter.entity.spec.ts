import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Element4counterEntity } from './element4counterEntity';
import { BlockEntity } from '../block/block.entity';
import { ElementEntity } from './element.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';

describe('Element for counter entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element for counter fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Element4counterEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create element counter', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = await Object.assign(
        new Element4counterEntity(),
        {parent, attribute, point, count: 100},
      ).save();

      expect(inst.id).toBe(1);
      expect(inst.count).toBe(100);
      expect(inst.attribute.id).toBe('CURRENT');
      expect(inst.point.id).toBe('LONDON');
      expect(inst.parent.id).toBe('NAME');
    });

    test('Shouldn`t create. without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await expect(Object.assign(
        new Element4counterEntity(),
        {attribute, point, count: 100},
      ).save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await expect(Object.assign(
        new Element4counterEntity(),
        {parent, point, count: 100},
      ).save()).rejects.toThrow('attributeId');
    });

    test('Shouldn`t create without point', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();

      await expect(Object.assign(
        new Element4counterEntity(),
        {parent, attribute, count: 100},
      ).save()).rejects.toThrow('pointId');
    });

    test('Shouldn`t create without count', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await expect(Object.assign(
        new Element4counterEntity(),
        {parent, attribute, point},
      ).save()).rejects.toThrow('count');
    });

    test('Should create duplicate item', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(
        new Element4counterEntity(),
        {parent, attribute, point, count: 100},
      );

      await source.getRepository(Element4counterEntity).insert(inst);
      await expect(source.getRepository(Element4counterEntity).insert(inst)).rejects.toThrow('duplicate');
    });
  });

  describe('Element with element for counter', () => {
    test('Should get element with count', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(
        new Element4counterEntity(),
        {parent, attribute, point, count: 100},
      ).save();

      const item = await source.getRepository(ElementEntity).findOne({
        where: {id: 'NAME'},
        relations: {counter: {point: true}},
      });

      expect(item.counter[0].count).toBe(100);
    });
  });
});