import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from './block.entity';
import { ElementEntity } from './element.entity';
import { PropertyEntity } from '../../settings/model/property.entity';
import { SectionEntity } from './section.entity';
import { Element4sectionEntity } from './element4section.entity';

describe('Element section property entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element4section fields', () => {
    test('Should create element value', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new ElementEntity(),
        {id: 'NAME', block},
      ).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const section = await Object.assign(new SectionEntity(), {block}).save();

      const inst = await Object.assign(new Element4sectionEntity(), {parent, property, section}).save();

      expect(inst.id).toBe(1);
    });

    test('Shouldn`t create without parent', async () => {
      const block = await new BlockEntity().save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const section = await Object.assign(new SectionEntity(), {block}).save();

      const inst = Object.assign(new Element4sectionEntity(), {property, section});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new ElementEntity(),
        {id: 'NAME', block},
      ).save();
      const section = await Object.assign(new SectionEntity(), {block}).save();

      const inst = Object.assign(new Element4sectionEntity(), {parent, section});

      await expect(inst.save()).rejects.toThrow('propertyId');
    });

    test('Shouldn`t create without section', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new ElementEntity(),
        {id: 'NAME', block},
      ).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();

      const inst = Object.assign(new Element4sectionEntity(), {parent, property});

      await expect(inst.save()).rejects.toThrow('sectionId');
    });
  });
});