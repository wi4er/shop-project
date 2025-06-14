import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { DirectoryEntity } from './directory.entity';
import { PointEntity } from '../point/point.entity';
import { Directory4pointEntity } from './directory4point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

describe('DirectoryEntity point attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('DirectoryEntity point fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Directory4pointEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create registry point', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'COUNTRY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'ENGLAND', directory}).save();

      const inst = await Object.assign(
        new Directory4pointEntity(),
        {parent, attribute, point},
      ).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Directory4pointEntity(), {attribute, point});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Directory4pointEntity(), {parent, point});

      await expect(inst.save()).rejects.toThrow('attributeId');
    });

    test('Shouldn`t create without point', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();

      const inst = Object.assign(new Directory4pointEntity(), {parent, attribute});

      await expect(inst.save()).rejects.toThrow('pointId');
    });
  });

  describe('DirectoryEntity with point', () => {
    test('Should create block with points', async () => {
      const repo = source.getRepository(DirectoryEntity);
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'COUNTRY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'FRANCE', directory}).save();

      await Object.assign(new Directory4pointEntity(), {parent, attribute, point}).save();

      const inst = await repo.findOne({where: {id: 'CITY'}, relations: {point: {point: true}}});

      expect(inst.point).toHaveLength(1);
      expect(inst.point[0].point.id).toBe('FRANCE');
    });

    test('Shouldn`t create with duplicate points', async () => {
      const parent = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'COUNTRY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'FRANCE', directory}).save();

      await Object.assign(new Directory4pointEntity(), {parent, attribute, point}).save();
      await expect(
        Object.assign(new Directory4pointEntity(), {parent, attribute, point}).save(),
      ).rejects.toThrow('duplicate');
    });
  });
});