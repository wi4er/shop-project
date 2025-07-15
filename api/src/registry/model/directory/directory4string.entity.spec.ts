import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { DirectoryEntity } from './directory.entity';
import { Directory4stringEntity } from './directory4string.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';

describe('Directory to string attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Directory to string fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Directory4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create item', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const parent = await Object.assign(new DirectoryEntity(), {id: 'LIST'}).save();

      await Object.assign(new Directory4stringEntity(), {
        string: 'VALUE', attribute, parent, lang,
      }).save();
    });

    test('Should create without lang', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new DirectoryEntity(), {id: 'LIST'}).save();

      const inst = await Object.assign(new Directory4stringEntity(), {
        string: 'VALUE', attribute, parent,
      }).save();

      expect(inst.lang).toBeUndefined();
    });

    test('Shouldn`t create without attribute', async () => {
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const parent = await Object.assign(new DirectoryEntity(), {id: 'LIST'}).save();

      await expect(Object.assign(new Directory4stringEntity(), {
        string: 'VALUE', parent, lang,
      }).save()).rejects.toThrow('attributeId');
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      await expect(Object.assign(new Directory4stringEntity(), {
        string: 'VALUE', attribute, lang,
      }).save()).rejects.toThrow('parentId');
    });
  });

  describe('Directory with string', () => {
    test('Should create registry with string', async () => {
      const repo = source.getRepository(DirectoryEntity);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const parent = await Object.assign(new DirectoryEntity(), {id: 'ENUM'}).save();

      await Object.assign(new Directory4stringEntity(), {
        string: 'VALUE', attribute, parent, lang,
      }).save();

      const inst = await repo.findOne({
        relations: {string: true},
        where: {id: 'ENUM'},
      });

      expect(inst.string).toHaveLength(1);
    });

    test('Should create registry with string list', async () => {
      await Object.assign(new DirectoryEntity(), {id: 'LIST'}).save();
      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      for (let i = 0; i < 10; i++) {
        await Object.assign(new Directory4stringEntity(), {
          string: 'VALUE',
          attribute: 'NAME',
          parent: 'LIST',
          lang: 'EN',
        }).save();
      }

      const repo = source.getRepository(DirectoryEntity);
      const item = await repo.findOne({where: {id: 'LIST'}, relations: {string: true}});

      expect(item.string).toHaveLength(10);
    });

    test('Should clear string after registry deletion', async () => {
      const repo = source.getRepository(DirectoryEntity);
      const stingRepo = source.getRepository(Directory4stringEntity);
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new DirectoryEntity(), {id: 'ENUM'}).save();

      await Object.assign(new Directory4stringEntity(), {string: 'VALUE', attribute, parent, lang}).save();
      await repo.delete({id: 'ENUM'});

      expect(await stingRepo.find()).toEqual([]);
    });
  });
});