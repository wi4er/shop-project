import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { DirectoryEntity } from './directory.entity';
import { Point4stringEntity } from './point4string.entity';
import { PointEntity } from './point.entity';
import { PropertyEntity } from '../../settings/model/property.entity';
import { LangEntity } from '../../settings/model/lang.entity';

describe('Point string property entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Point string fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Point4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create item', async () => {
      const repo = source.getRepository(Point4stringEntity);

      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'ENUM'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'ITEM', directory}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      await Object.assign(new Point4stringEntity(), {
        string: 'VALUE', property, parent, lang,
      }).save();

      const item = await repo.findOne({where: {id: 1}, loadRelationIds: true});

      expect(item.id).toBe(1);
      expect(item.property).toBe('NAME');
      expect(item.parent).toBe('ITEM');
      expect(item.lang).toBe('EN');
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = Object.assign(
        new Point4stringEntity(),
        {string: 'VALUE', property}
      );

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const directory = await Object.assign(new DirectoryEntity(), {id: 'ENUM'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'ITEM', directory}).save();

      const inst = Object.assign(
        new Point4stringEntity(),
        {string: 'VALUE', parent}
      );

      await expect(inst.save()).rejects.toThrow('propertyId');
    });
  });

  describe('Point with string', () => {
    test('Should create directory with string', async () => {
      const repo = source.getRepository(PointEntity);

      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'ENUM'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'ITEM', directory, property}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      await Object.assign(new Point4stringEntity(), {
        string: 'VALUE', property, parent, lang,
      }).save();

      const inst = await repo.findOne({
        relations: {string: true},
        where: {id: 'ITEM'},
      });

      expect(inst.string).toHaveLength(1);
      expect(inst.string[0].string).toBe('VALUE');
    });

    test('Should clear string after directory deletion', async () => {
      const repo = source.getRepository(PointEntity);
      const stingRepo = source.getRepository(Point4stringEntity);

      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'ENUM'}).save();
      const parent = await Object.assign(new PointEntity(), {id: 'ITEM', directory, property}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      await Object.assign(new Point4stringEntity(), {string: 'VALUE', property, parent, lang}).save();
      await repo.delete({id: 'ITEM'});

      expect(await stingRepo.find()).toEqual([]);
    });
  });
});