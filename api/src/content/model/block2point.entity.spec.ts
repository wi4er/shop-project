import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from './block.entity';
import { DirectoryEntity } from '../../directory/model/directory.entity';
import { PointEntity } from '../../directory/model/point.entity';
import { Block2pointEntity } from './block2point.entity';
import { PropertyEntity } from '../../settings/model/property.entity';

describe('Block2point entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Block2point fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Block2pointEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create block point', async () => {
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = await Object.assign(
        new Block2pointEntity(),
        {parent, property, point},
      ).save();

      expect(inst.id).toBe(1);
    });
  });

  describe('Block with point', () => {
    test('Should create block with points', async () => {
      const repo = source.getRepository(BlockEntity);
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'PARIS', directory}).save();

      await Object.assign(new Block2pointEntity(), {parent, property, point}).save();

      const inst = await repo.findOne({where: {id: 1}, relations: {point: {point: true}}});

      expect(inst.point).toHaveLength(1);
      expect(inst.point[0].point.id).toBe('PARIS');
    });

    test('Shouldn`t create with duplicate points', async () => {
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      await Object.assign(new Block2pointEntity(), {parent, property, point}).save();
      await expect(
        Object.assign(new Block2pointEntity(), {parent, property, point}).save(),
      ).rejects.toThrow('duplicate');
    });
  });
});