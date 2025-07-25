import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { SectionEntity } from './section.entity';
import { BlockEntity } from '../block/block.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { Section4pointEntity } from './section4point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

describe('SectionEntity point attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('SectionEntity point attribute fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(SectionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create section point', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = await Object.assign(new Section4pointEntity(), {parent, attribute, point}).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Section4pointEntity(), {attribute, point});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Section4pointEntity(), {parent, point});

      await expect(inst.save()).rejects.toThrow('attributeId');
    });

    test('Shouldn`t create without point', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();

      const inst = Object.assign(new Section4pointEntity(), {parent, attribute});

      await expect(inst.save()).rejects.toThrow('pointId');
    });
  });

  describe('SectionEntity with points', () => {
    test('Shouldn`t create with duplicate points', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Section4pointEntity(), {parent, attribute, point}).save();
      await expect(
        Object.assign(new Section4pointEntity(), {parent, attribute, point}).save(),
      ).rejects.toThrow('duplicate');
    });
  });
});