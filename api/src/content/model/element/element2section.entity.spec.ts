import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Element2sectionEntity } from './element2section.entity';
import { ElementEntity } from './element.entity';
import { BlockEntity } from '../block/block.entity';
import { SectionEntity } from '../section/section.entity';

describe('ElementSection entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('ElementSection fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Element2sectionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create without section', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(
        new ElementEntity(),
        {id: 'NAME', block},
      ).save();

      await expect(
        Object.assign(new Element2sectionEntity(), {parent}).save(),
      ).rejects.toThrow('sectionId');
    });

    test('Shouldn`t create without parent', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const section = await Object.assign(
        new SectionEntity(),
        {block},
      ).save();

      await expect(
        Object.assign(new Element2sectionEntity(), {section}).save(),
      ).rejects.toThrow('parentId');
    });
  });

  describe('Element in section', () => {
    test('Should create element in section', async () => {
      const repo = source.getRepository(ElementEntity);

      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();
      const section = await Object.assign(new SectionEntity(), {id: 'SECTION', block}).save();

      await Object.assign(new Element2sectionEntity(), {parent, section}).save();

      const inst = await repo.findOne({
        where: {id: 'NAME'},
        relations: {parent: {section: true}},
      });

      expect(inst.parent).toHaveLength(1);
      expect(inst.parent[0].section.id).toBe('SECTION');
    });
  });
});