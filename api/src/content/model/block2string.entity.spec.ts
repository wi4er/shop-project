import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { Block2stringEntity } from './block2string.entity';
import { BlockEntity } from './block.entity';
import { PropertyEntity } from '../../property/model/property.entity';
import { LangEntity } from '../../lang/model/lang.entity';

describe('BlockString entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('BlockString fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Block2stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create block string', async () => {
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = new Block2stringEntity();
      inst.string = 'VALUE';
      inst.parent = parent;
      inst.property = property;
      const saved = await inst.save();

      expect(saved.id).toBe(1);
      expect(saved.string).toBe('VALUE');
    });

    test('Should create block string with lang', async () => {
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const inst = new Block2stringEntity();
      inst.string = 'VALUE';
      inst.parent = parent;
      inst.property = property;
      inst.lang = lang;
      await inst.save();
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = new Block2stringEntity();
      inst.string = 'VALUE';
      inst.property = property;
      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const parent = await new BlockEntity().save();

      const inst = new Block2stringEntity();
      inst.string = 'VALUE';
      inst.parent = parent;
      await expect(inst.save()).rejects.toThrow('propertyId');
    });

    test('Should create block string with lang', async () => {
      const parent = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = Object.assign(
        new Block2stringEntity(),
        {
          string: 'VALUE',
          parent,
          property,
          lang: 'WRONG',
        },
      );

      await expect(inst.save()).rejects.toThrow('violates foreign key constraint');
    });
  });
});