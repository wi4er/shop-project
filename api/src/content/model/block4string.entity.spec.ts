import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { Block4stringEntity } from './block4string.entity';
import { BlockEntity } from './block.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { LangEntity } from '../../settings/model/lang.entity';

describe('BlockString entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('BlockString fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Block4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create block string', async () => {
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = new Block4stringEntity();
      inst.string = 'VALUE';
      inst.parent = parent;
      inst.attribute = property;
      const saved = await inst.save();

      expect(saved.id).toBe(1);
      expect(saved.string).toBe('VALUE');
    });

    test('Should create block string with lang', async () => {
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const inst = new Block4stringEntity();
      inst.string = 'VALUE';
      inst.parent = parent;
      inst.attribute = property;
      inst.lang = lang;
      await inst.save();
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = new Block4stringEntity();
      inst.string = 'VALUE';
      inst.attribute = property;
      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const parent = await new BlockEntity().save();

      const inst = new Block4stringEntity();
      inst.string = 'VALUE';
      inst.parent = parent;
      await expect(inst.save()).rejects.toThrow('propertyId');
    });

    test('Shouldn`t create with wrong lang', async () => {
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = Object.assign(
        new Block4stringEntity(),
        {
          string: 'VALUE',
          parent,
          property,
          lang: 'WRONG',
        },
      );

      await expect(inst.save()).rejects.toThrow('foreign key');
    });
  });
});