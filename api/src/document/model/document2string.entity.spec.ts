import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { PropertyEntity } from '../../settings/model/property.entity';
import { LangEntity } from '../../settings/model/lang.entity';
import { DocumentEntity } from './document.entity';
import { Document2stringEntity } from './document2string.entity';

describe('Document2string entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  describe('Document2string fields', () => {
    test('Should create item', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const parent = await new DocumentEntity().save();

      const inst = new Document2stringEntity();
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
      const parent = await new DocumentEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = new Document2stringEntity();
      inst.property = property;
      inst.string = 'VALUE';
      inst.parent = parent;
      await inst.save();

      expect(inst.lang).toBeUndefined();
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = new Document2stringEntity();
      inst.property = property;
      inst.string = 'VALUE';

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const parent = await new DocumentEntity().save();

      const inst = new Document2stringEntity();
      inst.parent = parent;
      inst.string = 'VALUE';

      await expect(inst.save()).rejects.toThrow('propertyId');
    });
  });

  describe('Document with strings', () => {
    test('Should create lang with strings', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await new DocumentEntity().save();

      for (let i = 0; i < 10; i++) {
        const inst = new Document2stringEntity();
        inst.property = property;
        inst.parent = parent;
        inst.string = `VALUE_${i}`;

        await inst.save();
      }

      const repo = source.getRepository(DocumentEntity);
      const inst = await repo.findOne({
        where: {id: 1},
        relations: {string: true},
      });

      expect(inst.string).toHaveLength(10);
    });

    test('Should delete string with lang', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await new DocumentEntity().save();

      for (let i = 0; i < 10; i++) {
        const inst = new Document2stringEntity();
        inst.property = property;
        inst.parent = parent;
        inst.string = `VALUE_${i}`;

        await inst.save();
      }

      const langRepo = source.getRepository(DocumentEntity);
      await langRepo.delete({id: 1});

      const strRepo = source.getRepository(Document2stringEntity);
      const list = await strRepo.find();
      expect(list).toHaveLength(0);
    });

    test('Should delete string with property', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await new DocumentEntity().save();

      for (let i = 0; i < 10; i++) {
        const inst = new Document2stringEntity();
        inst.property = property;
        inst.parent = parent;
        inst.string = `VALUE_${i}`;

        await inst.save();
      }

      const propRepo = source.getRepository(DocumentEntity);
      await propRepo.delete({id: 1});

      const strRepo = source.getRepository(Document2stringEntity);
      const list = await strRepo.find();
      expect(list).toHaveLength(0);
    });
  });
});