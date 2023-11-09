import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { PropertyEntity } from '../../property/model/property.entity';
import { DirectoryEntity } from './directory.entity';
import { PointEntity } from './point.entity';
import { Directory2pointEntity } from './directory2point.entity';

describe('Directory2point entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Directory2point fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Directory2pointEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create directory point', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'COUNTRY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'ENGLAND', directory}).save();

      const inst = await Object.assign(
        new Directory2pointEntity(),
        {parent, property, point},
      ).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Directory2pointEntity(), {property, point});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Directory2pointEntity(), {parent, point});

      await expect(inst.save()).rejects.toThrow('propertyId');
    });

    test('Shouldn`t create without point', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();

      const inst = Object.assign(new Directory2pointEntity(), {parent, property});

      await expect(inst.save()).rejects.toThrow('pointId');
    });
  });

  describe('Directory with point', () => {
    test('Should create block with points', async () => {
      const repo = source.getRepository(DirectoryEntity);
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'COUNTRY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'FRANCE', directory}).save();

      await Object.assign(new Directory2pointEntity(), {parent, property, point}).save();

      const inst = await repo.findOne({where: {id: 'CITY'}, relations: {point: {point: true}}});

      expect(inst.point).toHaveLength(1);
      expect(inst.point[0].point.id).toBe('FRANCE');
    });

    test('Shouldn`t create with duplicate points', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'COUNTRY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'FRANCE', directory}).save();

      await Object.assign(new Directory2pointEntity(), {parent, property, point}).save();
      await expect(
        Object.assign(new Directory2pointEntity(), {parent, property, point}).save(),
      ).rejects.toThrow('duplicate');
    });
  });
});