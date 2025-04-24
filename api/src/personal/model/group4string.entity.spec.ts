import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from '../../content/model/block.entity';
import { Group4stringEntity } from './group4string.entity';
import { GroupEntity } from './group.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';

describe('UserGroup string attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('UserGroup string fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Group4stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(Object.assign(
        new Group4stringEntity(),
        {string: 'VALUE', attribute},
      ).save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without attribute', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new GroupEntity(), {block}).save();

      await expect(Object.assign(
        new Group4stringEntity(),
        {string: 'VALUE', parent},
      ).save()).rejects.toThrow('attributeId');
    });
  });

  describe('UserGroup with strings', () => {
    test('Should create element with strings', async () => {
      const repo = source.getRepository(GroupEntity);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await new GroupEntity().save();

      await Object.assign(
        new Group4stringEntity(),
        {string: 'VALUE', parent, attribute},
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