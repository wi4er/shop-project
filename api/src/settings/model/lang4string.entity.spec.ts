import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { LangEntity } from './lang.entity';
import { Lang4stringEntity } from './lang4string.entity';
import { PropertyEntity } from './property.entity';

describe('Lang string property entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  describe('Lang string fields', () => {
    test('Should create item', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const parent = await Object.assign(new LangEntity(), {id: 'UA'}).save();

      const inst = new Lang4stringEntity();
      inst.property = property;
      inst.parent = parent;
      inst.string = 'VALUE';
      inst.lang = lang;
      await inst.save();

      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Should create without lang', async () => {
      const parent = await Object.assign(new LangEntity(), {id: 'UA'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = new Lang4stringEntity();
      inst.property = property;
      inst.string = 'VALUE';
      inst.parent = parent;
      await inst.save();

      expect(inst.lang).toBeUndefined();
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const inst = new Lang4stringEntity();
      inst.property = property;
      inst.string = 'VALUE';
      inst.lang = lang;

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const parent = await Object.assign(new LangEntity(), {id: 'UA'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const inst = new Lang4stringEntity();
      inst.parent = parent;
      inst.string = 'VALUE';
      inst.lang = lang;

      await expect(inst.save()).rejects.toThrow('propertyId');
    });
  });

  describe('Lang with strings', () => {
    test('Should create lang with strings', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new LangEntity(), {id: 'UA'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      for (let i = 0; i < 10; i++) {
        const inst = new Lang4stringEntity();
        inst.property = property;
        inst.parent = parent;
        inst.string = `VALUE_${i}`;
        inst.lang = lang;

        await inst.save();
      }

      const repo = source.getRepository(LangEntity);
      const inst = await repo.findOne({
        where: {id: 'UA'},
        relations: {string: true},
      });

      expect(inst.string).toHaveLength(10);
    });

    test('Should delete string with lang', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new LangEntity(), {id: 'GR'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      for (let i = 0; i < 10; i++) {
        const inst = new Lang4stringEntity();
        inst.property = property;
        inst.parent = parent;
        inst.string = `VALUE_${i}`;
        inst.lang = lang;

        await inst.save();
      }

      const langRepo = source.getRepository(LangEntity);
      await langRepo.delete({id: 'GR'});

      const strRepo = source.getRepository(Lang4stringEntity);
      const list = await strRepo.find();
      expect(list).toHaveLength(0);
    });

    test('Should delete string with property', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new LangEntity(), {id: 'GR'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      for (let i = 0; i < 10; i++) {
        const inst = new Lang4stringEntity();
        inst.property = property;
        inst.parent = parent;
        inst.string = `VALUE_${i}`;
        inst.lang = lang;

        await inst.save();
      }

      const propRepo = source.getRepository(PropertyEntity);
      await propRepo.delete({id: 'NAME'});

      const strRepo = source.getRepository(Lang4stringEntity);
      const list = await strRepo.find();
      expect(list).toHaveLength(0);
    });
  });
});