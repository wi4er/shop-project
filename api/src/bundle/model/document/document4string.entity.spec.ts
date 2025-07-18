import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { DocumentEntity } from './document.entity';
import { Document4stringEntity } from './document4string.entity';

describe('Document string attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('DocumentString fields', () => {
    test('Should create item', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const lang = await Object.assign(new LangEntity(), {id: 'EN'}).save();
      const parent = await new DocumentEntity().save();

      const inst = new Document4stringEntity();
      inst.attribute = attribute;
      inst.parent = parent;
      inst.string = 'VALUE';
      inst.lang = lang;
      await inst.save();
    });

    test('Should create without lang', async () => {
      const parent = await new DocumentEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = new Document4stringEntity();
      inst.attribute = attribute;
      inst.string = 'VALUE';
      inst.parent = parent;
      await inst.save();

      expect(inst.lang).toBeUndefined();
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = new Document4stringEntity();
      inst.attribute = attribute;
      inst.string = 'VALUE';

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const parent = await new DocumentEntity().save();

      const inst = new Document4stringEntity();
      inst.parent = parent;
      inst.string = 'VALUE';

      await expect(inst.save()).rejects.toThrow('attributeId');
    });
  });

  describe('Document with strings', () => {
    test('Should create lang with strings', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await new DocumentEntity().save();

      for (let i = 0; i < 10; i++) {
        const inst = new Document4stringEntity();
        inst.attribute = attribute;
        inst.parent = parent;
        inst.string = `VALUE_${i}`;

        await inst.save();
      }

      const repo = source.getRepository(DocumentEntity);
      const inst = await repo.findOne({
        where: {id: parent.id},
        relations: {string: true},
      });

      expect(inst.string).toHaveLength(10);
    });

    test('Should delete string with lang', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await new DocumentEntity().save();

      for (let i = 0; i < 10; i++) {
        const inst = new Document4stringEntity();
        inst.attribute = attribute;
        inst.parent = parent;
        inst.string = `VALUE_${i}`;

        await inst.save();
      }

      const langRepo = source.getRepository(DocumentEntity);
      await langRepo.delete({id: parent.id});

      const strRepo = source.getRepository(Document4stringEntity);
      const list = await strRepo.find();
      expect(list).toHaveLength(0);
    });

    test('Should delete string with attribute', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await new DocumentEntity().save();

      for (let i = 0; i < 10; i++) {
        const inst = new Document4stringEntity();
        inst.attribute = attribute;
        inst.parent = parent;
        inst.string = `VALUE_${i}`;

        await inst.save();
      }

      const propRepo = source.getRepository(DocumentEntity);
      await propRepo.delete({id: parent.id});

      const strRepo = source.getRepository(Document4stringEntity);
      const list = await strRepo.find();
      expect(list).toHaveLength(0);
    });
  });
});