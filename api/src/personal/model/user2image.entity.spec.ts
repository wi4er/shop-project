import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from '../../content/model/block.entity';
import { CollectionEntity } from '../../storage/model/collection.entity';
import { FileEntity } from '../../storage/model/file.entity';
import { User2imageEntity } from './user2image.entity';
import { UserEntity } from './user.entity';

describe('User image entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('User image fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(User2imageEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create without file', async () => {
      await Object.assign(new BlockEntity(), {}).save();
      const parent = await Object.assign(new UserEntity(), {login: 'user'}).save();

      await expect(
        Object.assign(new User2imageEntity(), {parent}).save(),
      ).rejects.toThrow('imageId');
    });

    test('Shouldn`t create without parent', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const image = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt1.txt`,
        },
      ).save();

      await expect(
        Object.assign(new User2imageEntity(), {image}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create duplicate', async () => {
      const parent = await Object.assign(new UserEntity(), {login: 'USER'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const image = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt1.txt`,
        },
      ).save();

      await Object.assign(new User2imageEntity(), {parent, image}).save();

      await expect(
        Object.assign(new User2imageEntity(), {parent, image}).save(),
      ).rejects.toThrow('duplicate');
    });
  });

  describe('User with image', () => {
    test('Should create element with file', async () => {
      const repo = source.getRepository(UserEntity);
      const parent = await Object.assign(new UserEntity(), {login: 'USER'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();
      const image = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: `txt/txt1.txt`,
        },
      ).save();

      await Object.assign(new User2imageEntity(), {parent, image}).save();

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {image: {image: {collection: true}}},
      });

      expect(inst.image).toHaveLength(1);
      expect(inst.image[0].image.collection.id).toBe('DETAIL');
    });

    test('Should create with multi image', async () => {
      const repo = source.getRepository(UserEntity);
      const parent = await Object.assign(new UserEntity(), {login: 'USER'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'DETAIL'}).save();

      for (let i = 0; i < 10; i++) {
        const image = await Object.assign(
          new FileEntity(),
          {
            collection,
            original: 'name.txt',
            mimetype: 'image/jpeg',
            path: `txt/txt${i}.txt`,
          },
        ).save();
        await Object.assign(new User2imageEntity(), {parent, image}).save();
      }

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {image: {image: {collection: true}}},
      });

      expect(inst.image).toHaveLength(10);
    });
  });
});