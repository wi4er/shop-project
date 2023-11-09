import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { Directory2pointEntity } from './directory2point.entity';
import { DirectoryEntity } from './directory.entity';
import { PropertyEntity } from '../../property/model/property.entity';
import { PointEntity } from './point.entity';
import { Point2pointEntity } from './point2point.entity';

describe('Point2point entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Point2point fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Point2pointEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create point with point', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'RULES'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      const inst = await Object.assign(
        new Point2pointEntity(),
        {parent, property, point},
      ).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create without parent', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'RULES'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      const inst = Object.assign(new Directory2pointEntity(), {property, point});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      const inst = Object.assign(new Directory2pointEntity(), {parent, point});

      await expect(inst.save()).rejects.toThrow('propertyId');
    });

    test('Shouldn`t create without point', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'RULES'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Directory2pointEntity(), {parent, property});

      await expect(inst.save()).rejects.toThrow('pointId');
    });
  });

  describe('Point with point', () => {
    test('Should create point with point', async () => {
      const repo = source.getRepository(PointEntity);
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'RULES'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      await Object.assign(new Point2pointEntity(), {parent, property, point}).save();

      const inst = await repo.findOne({where: {id: 'LONDON'}, relations: {point: {point: true}}});

      expect(inst.point).toHaveLength(1);
      expect(inst.point[0].point.id).toBe('PARIS');
    });

    test('Shouldn`t create with duplicate points', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'RULES'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      await Object.assign(new Point2pointEntity(), {parent, property, point}).save();
      await expect(
        Object.assign(new Point2pointEntity(), {parent, property, point}).save(),
      ).rejects.toThrow('duplicate');
    });
  });
});