import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { BlockEntity } from '../block/block.entity';
import { ElementEntity } from './element.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { SectionEntity } from '../section/section.entity';
import { Element4sectionEntity } from './element4section.entity';

describe('ElementEntity section attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element4section fields', () => {
    test('Should create element value', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const section = await Object.assign(new SectionEntity(), {block}).save();

      const inst = await Object.assign(new Element4sectionEntity(), {parent, attribute, section}).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create without parent', async () => {
      const block = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const section = await Object.assign(new SectionEntity(), {block}).save();

      const inst = Object.assign(new Element4sectionEntity(), {attribute, section});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const section = await Object.assign(new SectionEntity(), {block}).save();

      const inst = Object.assign(new Element4sectionEntity(), {parent, section});

      await expect(inst.save()).rejects.toThrow('attributeId');
    });

    test('Shouldn`t create without section', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();

      const inst = Object.assign(new Element4sectionEntity(), {parent, attribute});

      await expect(inst.save()).rejects.toThrow('sectionId');
    });
  });
});