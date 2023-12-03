import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from '../../content/model/block.entity';
import { UserGroup2stringEntity } from './user-group2string.entity';
import { UserGroupEntity } from './user-group.entity';
import { PropertyEntity } from '../../settings/model/property.entity';

describe('UserGroup2string entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('UserGroup2string fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(UserGroup2stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      await expect(Object.assign(
        new UserGroup2stringEntity(),
        {string: 'VALUE', property},
      ).save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new UserGroupEntity(), {block}).save();

      await expect(Object.assign(
        new UserGroup2stringEntity(),
        {string: 'VALUE', parent},
      ).save()).rejects.toThrow('propertyId');
    });
  });

  describe('UserGroup with strings', () => {
    test('Should create element with strings', async () => {
      const repo = source.getRepository(UserGroupEntity);
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await new UserGroupEntity().save();

      await Object.assign(
        new UserGroup2stringEntity(),
        {string: 'VALUE', parent, property},
      ).save();

      const inst = await repo.findOne({
        where: {id: parent.id},
        relations: {string: true},
      });

      expect(inst.string).toHaveLength(1);
      expect(inst.string[0].string).toBe('VALUE');
    });
  });
});