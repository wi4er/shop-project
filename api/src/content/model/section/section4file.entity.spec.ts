import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { CollectionEntity } from '../../../storage/model/collection.entity';
import { FileEntity } from '../../../storage/model/file.entity';
import { BlockEntity } from '../block/block.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { Section4fileEntity } from './section4file.entity';
import { SectionEntity } from './section.entity';

describe('Section for file attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Section for file fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Section4fileEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create duplicate', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const file = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt1.txt`,
        },
      ).save();
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await Object.assign(new Section4fileEntity(), {parent, attribute, file}).save();

      await expect(
        Object.assign(new Section4fileEntity(), {parent, attribute, file}).save(),
      ).rejects.toThrow('duplicate');
    });

    test('Shouldn`t create without file', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Section4fileEntity(), {parent, attribute}).save(),
      ).rejects.toThrow('fileId');
    });

    test('Shouldn`t create without parent', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const file = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt1.txt`,
        },
      ).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Section4fileEntity(), {file, attribute}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const file = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt1.txt`,
        },
      ).save();

      await expect(
        Object.assign(new Section4fileEntity(), {parent, file}).save(),
      ).rejects.toThrow('attributeId');
    });
  });

  describe('Section with file', () => {
    test('Should create element with file', async () => {
      const repo = source.getRepository(SectionEntity);
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new SectionEntity(),
        {id: 'SECTION', block},
      ).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      const file = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt1.txt`,
        },
      ).save();

      await Object.assign(new Section4fileEntity(), {parent, attribute, file}).save();

      const inst = await repo.findOne({
        where: {id: 'SECTION'},
        relations: {file: {file: {collection: true}}},
      });

      expect(inst.file).toHaveLength(1);
      expect(inst.file[0].file.collection.id).toBe('DETAIL');
    });

    test('Should create with multi file', async () => {
      const repo = source.getRepository(SectionEntity);
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new SectionEntity(),
        {id: 'SECTION', block},
      ).save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

      for (let i = 0; i < 10; i++) {
        const file = await Object.assign(
          new FileEntity(),
          {
            collection,
            original: 'name.txt',
            mimetype: 'image/jpeg',
            path: `txt/txt${i}.txt`,
          },
        ).save();
        await Object.assign(new Section4fileEntity(), {parent, attribute, file}).save();
      }

      const inst = await repo.findOne({
        where: {id: 'SECTION'},
        relations: {file: {file: {collection: true}}},
      });

      expect(inst.file).toHaveLength(10);
      expect(inst.file[0].file.collection.id).toBe('DETAIL');
    });
  });
});