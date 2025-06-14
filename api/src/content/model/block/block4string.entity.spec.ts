import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Block4stringEntity } from './block4string.entity';
import { BlockEntity } from './block.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';

describe('BlockString entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
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
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = new Block4stringEntity();
      inst.string = 'VALUE';
      inst.parent = parent;
      inst.attribute = attribute;
      const saved = await inst.save();

      expect(saved.id).toBe(1);
      expect(saved.string).toBe('VALUE');
    });

    test('Should create block string with lang', async () => {
      const parent = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const inst = new Block4stringEntity();
      inst.string = 'VALUE';
      inst.parent = parent;
      inst.attribute = attribute;
      inst.lang = lang;
      await inst.save();
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = new Block4stringEntity();
      inst.string = 'VALUE';
      inst.attribute = attribute;
      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const parent = await new BlockEntity().save();

      const inst = new Block4stringEntity();
      inst.string = 'VALUE';
      inst.parent = parent;
      await expect(inst.save()).rejects.toThrow('attributeId');
    });

    test('Shouldn`t create with wrong lang', async () => {
      const parent = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = Object.assign(
        new Block4stringEntity(),
        {
          string: 'VALUE',
          parent,
          attribute,
          lang: 'WRONG',
        },
      );

      await expect(inst.save()).rejects.toThrow('foreign key');
    });
  });
});