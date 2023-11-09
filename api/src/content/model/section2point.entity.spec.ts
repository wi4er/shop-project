import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { SectionEntity } from './section.entity';
import { BlockEntity } from './block.entity';
import { PropertyEntity } from '../../property/model/property.entity';
import { DirectoryEntity } from '../../directory/model/directory.entity';
import { PointEntity } from '../../directory/model/point.entity';
import { Section2pointEntity } from './section2point.entity';

describe('Section2point entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Section2point fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(SectionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create section point', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = await Object.assign(new Section2pointEntity(), {parent, property, point}).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Section2pointEntity(), {property, point});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Section2pointEntity(), {parent, point});

      await expect(inst.save()).rejects.toThrow('propertyId');
    });

    test('Shouldn`t create without point', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();

      const inst = Object.assign(new Section2pointEntity(), {parent, property});

      await expect(inst.save()).rejects.toThrow('pointId');
    });
  });

  describe('Section with points', () => {
    test('Shouldn`t create with duplicate points', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Section2pointEntity(), {parent, property, point}).save();
      await expect(
        Object.assign(new Section2pointEntity(), {parent, property, point}).save(),
      ).rejects.toThrow();
    });
  });
});