import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from './block.entity';
import { Element2pointEntity } from './element2point.entity';
import { ElementEntity } from './element.entity';
import { PropertyEntity } from '../../property/model/property.entity';
import { DirectoryEntity } from '../../directory/model/directory.entity';
import { PointEntity } from '../../directory/model/point.entity';

describe('ElementValue entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('ElementValue fields', () => {
    test('Should create element value', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), { block }).save();
      const property = await Object.assign(new PropertyEntity(), { id: 'CURRENT' }).save();
      const directory = await Object.assign(new DirectoryEntity(), { id: 'CITY' }).save();
      const value = await Object.assign(new PointEntity(), { id: 'LONDON', directory }).save();

      const inst = await Object.assign(new Element2pointEntity(), { parent, property, value }).save();

      expect(inst.id).toBe(1);
    });

    test('Should get empty list', async () => {
      const repo = source.getRepository(Element2pointEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });
  });

  describe('Element with values', () => {
    test('Should create element with values', async () => {
      const repo = source.getRepository(ElementEntity);
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), { block }).save();
      const property = await Object.assign(new PropertyEntity(), { id: 'CURRENT' }).save();
      const directory = await Object.assign(new DirectoryEntity(), { id: 'CITY' }).save();
      const value = await Object.assign(new PointEntity(), { id: 'LONDON', directory }).save();

      await Object.assign(new Element2pointEntity(), { parent, property, value }).save();

      const inst = await repo.findOne({ where: { id: 1 }, relations: { point: { value: true } } });

      expect(inst.point).toHaveLength(1);
      expect(inst.point[0].point.id).toBe('LONDON')
    });

    test('Shouldn`t create with duplicate values', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), { block }).save();
      const property = await Object.assign(new PropertyEntity(), { id: 'CURRENT' }).save();
      const directory = await Object.assign(new DirectoryEntity(), { id: 'CITY' }).save();
      const value = await Object.assign(new PointEntity(), { id: 'LONDON', directory }).save();

      await Object.assign(new Element2pointEntity(), { parent, property, value }).save();
      await expect(
        Object.assign(new Element2pointEntity(), { parent, property, value }).save()
      ).rejects.toThrow();
    });
  });
});