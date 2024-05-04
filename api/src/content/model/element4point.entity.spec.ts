import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from './block.entity';
import { Element4pointEntity } from './element4point.entity';
import { ElementEntity } from './element.entity';
import { DirectoryEntity } from '../../directory/model/directory.entity';
import { PointEntity } from '../../directory/model/point.entity';
import { PropertyEntity } from '../../settings/model/property.entity';

describe('ElementPoint entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('ElementPoint fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Element4pointEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create element point', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new ElementEntity(),
        {id: 'NAME', block},
      ).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = await Object.assign(
        new Element4pointEntity(),
        {parent, property, point},
      ).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(
        new Element4pointEntity(),
        {property, point},
      );

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new ElementEntity(),
        {id: 'NAME', block},
      ).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(
        new Element4pointEntity(),
        {parent, point},
      );

      await expect(inst.save()).rejects.toThrow('propertyId');
    });

    test('Shouldn`t create without point', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new ElementEntity(),
        {id: 'NAME', block},
      ).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();

      const inst = Object.assign(
        new Element4pointEntity(),
        {parent, property},
      );

      await expect(inst.save()).rejects.toThrow('pointId');
    });
  });

  describe('Element with point', () => {
    test('Should create element with values', async () => {
      const repo = source.getRepository(ElementEntity);
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new ElementEntity(),
        {id: 'NAME', block},
      ).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Element4pointEntity(), {parent, property, point}).save();

      const inst = await repo.findOne({where: {id: 'NAME'}, relations: {point: {point: true}}});

      expect(inst.point).toHaveLength(1);
      expect(inst.point[0].point.id).toBe('LONDON');
    });

    test('Shouldn`t create with duplicate values', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new ElementEntity(),
        {id: 'NAME', block},
      ).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Element4pointEntity(), {parent, property, point}).save();
      await expect(
        Object.assign(new Element4pointEntity(), {parent, property, point}).save(),
      ).rejects.toThrow('duplicate');
    });
  });
});