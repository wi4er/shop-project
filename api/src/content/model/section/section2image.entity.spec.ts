import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { BlockEntity } from '../block/block.entity';
import { CollectionEntity } from '../../../storage/model/collection.entity';
import { FileEntity } from '../../../storage/model/file.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { Section2imageEntity } from './section2image.entity';
import { SectionEntity } from './section.entity';

describe('Section image entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Section image fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Section2imageEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create without file', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();

      await expect(
        Object.assign(new Section2imageEntity(), {parent}).save(),
      ).rejects.toThrow('imageId');
    });

    test('Shouldn`t create without parent', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const image = await Object.assign(
        new FileEntity(),
        {
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: 'txt/txt.txt',
          collection,
        },
      ).save();

      await expect(
        Object.assign(new Section2imageEntity(), {image}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create duplicate', async () => {
      const block = await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new SectionEntity(), {block}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const image = await Object.assign(
        new FileEntity(),
        {
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: 'txt/txt.txt',
          collection,
        },
      ).save();

      await Object.assign(new Section2imageEntity(), {parent, image}).save();

      await expect(
        Object.assign(new Section2imageEntity(), {parent, image}).save(),
      ).rejects.toThrow('duplicate');
    });
  });

  describe('Section with image', () => {
    test('Should create element with file', async () => {
      const repo = source.getRepository(SectionEntity);
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new SectionEntity(),
        {id: 'SECTION', block},
      ).save();
      const property = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      const image = await Object.assign(
        new FileEntity(),
        {
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: 'txt/txt.txt',
          collection,
        },
      ).save();

      await Object.assign(new Section2imageEntity(), {parent, property, image}).save();

      const inst = await repo.findOne({
        where: {id: 'SECTION'},
        relations: {image: {image: {collection: true}}},
      });

      expect(inst.image).toHaveLength(1);
      expect(inst.image[0].image.collection.id).toBe('DETAIL');
    });

    test('Should create with multi image', async () => {
      const repo = source.getRepository(SectionEntity);
      const block = await new BlockEntity().save();
      const parent = await Object.assign(
        new SectionEntity(),
        {id: 'SECTION',block}
      ).save();
      const property = await Object.assign(new AttributeEntity(), {id: 'CURRENT'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

      for (let i = 0; i < 10; i++) {
        const image = await Object.assign(
          new FileEntity(),
          {
            original: 'name.txt',
            mimetype: 'image/jpeg',
            path: `txt/txt_${i}.txt`,
            collection,
          },
        ).save();
        await Object.assign(new Section2imageEntity(), {parent, property, image}).save();
      }

      const inst = await repo.findOne({
        where: {id: 'SECTION'},
        relations: {image: {image: {collection: true}}},
      });

      expect(inst.image).toHaveLength(10);
      expect(inst.image[0].image.collection.id).toBe('DETAIL');
    });
  });
});