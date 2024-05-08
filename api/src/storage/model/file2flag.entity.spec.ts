import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FlagEntity } from '../../settings/model/flag.entity';
import { CollectionEntity } from './collection.entity';
import { FileEntity } from './file.entity';
import { File2flagEntity } from './file2flag.entity';

describe('File 2 flag entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  describe('File2flag fields', () => {
    test('Should create file flag', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: 'txt/txt.txt',
        },
      ).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = new File2flagEntity();
      inst.parent = parent;
      inst.flag = flag;
      await inst.save();

      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Shouldn`t create without flag', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: 'txt/txt.txt',
        },
      ).save();

      const inst = new File2flagEntity();
      inst.parent = parent;

      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t create without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = new File2flagEntity();
      inst.flag = flag;

      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });

  describe('File with flag', () => {
    test('Should create file with flag', async () => {
      const repo = source.getRepository(FileEntity);

      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: 'txt/txt.txt',
        },
      ).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new File2flagEntity(), {parent, flag}).save();

      const inst = await repo.findOne({where: {id: 1}, relations: {flag: {flag: true}}});

      expect(inst.flag).toHaveLength(1);
      expect(inst.flag[0].id).toBe(1);
      expect(inst.flag[0].flag.id).toBe('ACTIVE');
    });

    test('Shouldn`t create duplicate flag', async () => {
      const collection = await Object.assign(new CollectionEntity(), {id: 'SHORT'}).save();
      const parent = await Object.assign(
        new FileEntity(),
        {
          collection,
          original: 'name.txt',
          mimetype: 'image/jpeg',
          path: 'txt/txt.txt',
        },
      ).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new File2flagEntity(), {parent, flag}).save();

      await expect(
        Object.assign(new File2flagEntity(), {parent, flag}).save(),
      ).rejects.toThrow('duplicate key');
    });
  });
});