import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { Directory4pointEntity } from './directory4point.entity';
import { DirectoryEntity } from './directory.entity';
import { PointEntity } from './point.entity';
import { Point4pointEntity } from './point4point.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';

describe('Point2point entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Point2point fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Point4pointEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create point with point', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'RULES'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      const inst = await Object.assign(
        new Point4pointEntity(),
        {parent, attribute, point},
      ).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create without parent', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'RULES'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      const inst = Object.assign(new Directory4pointEntity(), {attribute, point});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      const inst = Object.assign(new Directory4pointEntity(), {parent, point});

      await expect(inst.save()).rejects.toThrow('attributeId');
    });

    test('Shouldn`t create without point', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'RULES'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Directory4pointEntity(), {parent, attribute});

      await expect(inst.save()).rejects.toThrow('pointId');
    });
  });

  describe('Point with point', () => {
    test('Should create point with point', async () => {
      const repo = source.getRepository(PointEntity);
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'RULES'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      await Object.assign(new Point4pointEntity(), {parent, attribute, point}).save();

      const inst = await repo.findOne({where: {id: 'LONDON'}, relations: {point: {point: true}}});

      expect(inst.point).toHaveLength(1);
      expect(inst.point[0].point.id).toBe('PARIS');
    });

    test('Shouldn`t create with duplicate points', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'RULES'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      await Object.assign(new Point4pointEntity(), {parent, attribute, point}).save();
      await expect(
        Object.assign(new Point4pointEntity(), {parent, attribute, point}).save(),
      ).rejects.toThrow('duplicate');
    });
  });
});