import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from './block.entity';
import { DirectoryEntity } from '../../registry/model/directory.entity';
import { PointEntity } from '../../registry/model/point.entity';
import { Block4pointEntity } from './block4point.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';

describe('Block2point entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Block2point fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Block4pointEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create block point', async () => {
      const parent = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = await Object.assign(new Block4pointEntity(), {parent, attribute, point}).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Block4pointEntity(), {attribute, point});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const parent = await new BlockEntity().save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new Block4pointEntity(), {parent, point});

      await expect(inst.save()).rejects.toThrow('attributeId');
    });

    test('Shouldn`t create without point', async () => {
      const parent = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();

      const inst = Object.assign(new Block4pointEntity(), {parent, attribute});

      await expect(inst.save()).rejects.toThrow('pointId');
    });
  });

  describe('Block with point', () => {
    test('Should create block with points', async () => {
      const repo = source.getRepository(BlockEntity);
      const parent = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      await Object.assign(new Block4pointEntity(), {parent, attribute, point}).save();

      const inst = await repo.findOne({where: {id: 1}, relations: {point: {point: true}}});

      expect(inst.point).toHaveLength(1);
      expect(inst.point[0].point.id).toBe('PARIS');
    });

    test('Shouldn`t create with duplicate points', async () => {
      const parent = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Block4pointEntity(), {parent, attribute, point}).save();
      await expect(
        Object.assign(new Block4pointEntity(), {parent, attribute, point}).save(),
      ).rejects.toThrow('duplicate');
    });
  });
});