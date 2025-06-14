import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { BlockEntity } from '../block/block.entity';
import { Section4stringEntity } from './section4string.entity';
import { SectionEntity } from './section.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

describe('SectionString entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('SectionString fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Section4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(Object.assign(
        new Section4stringEntity(),
        {string: 'VALUE', attribute},
      ).save()).rejects.toThrow();
    });

    test('Shouldn`t create without attribute', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();

      await expect(Object.assign(
        new Section4stringEntity(),
        {string: 'VALUE', parent},
      ).save()).rejects.toThrow('attributeId');
    });
  });

  describe('SectionEntity with strings', () => {
    test('Should create element with strings', async () => {
      const repo = source.getRepository(SectionEntity);

      const block = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();

      await Object.assign(
        new Section4stringEntity(),
        {string: 'VALUE', parent, attribute},
      ).save();

      const inst = await repo.findOne({
        where: {id: parent.id},
        relations: {string: {attribute: true}},
      });

      expect(inst.string).toHaveLength(1);
      expect(inst.string[0].string).toBe('VALUE');
      expect(inst.string[0].attribute.id).toBe('NAME');
    });
  });
});