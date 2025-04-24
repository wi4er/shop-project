import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { UserEntity } from './user.entity';
import { User4stringEntity } from './user4string.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';

describe('User2String entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('User with string attribute', () => {
    test('Should create user with string', async () => {
      const repo = source.getRepository(UserEntity);
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new UserEntity(), {id: '1', login: 'USER'}).save();

      await Object.assign(new User4stringEntity(), {string: 'TEST', attribute, parent}).save();

      const inst = await repo.findOne({
        where: {id: '1'},
        relations: {string: {attribute: true}}
      });

      expect(inst.string).toHaveLength(1);
      expect(inst.string[0].string).toBe('TEST');
      expect(inst.string[0].attribute.id).toBe('NAME');
    });

    test('Should create user with list of attributes', async () => {
      const repo = source.getRepository(UserEntity);

      const prop1 = await Object.assign(new AttributeEntity(), {id: 'PROP_1'}).save();
      const prop2 = await Object.assign(new AttributeEntity(), {id: 'PROP_2'}).save();
      const prop3 = await Object.assign(new AttributeEntity(), {id: 'PROP_3'}).save();

      const parent = await Object.assign(new UserEntity(), {id: '1', login: 'USER'}).save();

      await Object.assign(new User4stringEntity(), {string: 'TEST_1', attribute: prop1, parent}).save();
      await Object.assign(new User4stringEntity(), {string: 'TEST_2', attribute: prop2, parent}).save();
      await Object.assign(new User4stringEntity(), {string: 'TEST_3', attribute: prop3, parent}).save();

      const inst = await repo.findOne({
        where: {id: '1'},
        relations: {string: {attribute: true}},
      });

      expect(inst.string).toHaveLength(3);
      expect(inst.string[0].string).toBe('TEST_1');
      expect(inst.string[0].attribute.id).toBe('PROP_1');

      expect(inst.string[1].string).toBe('TEST_2');
      expect(inst.string[1].attribute.id).toBe('PROP_2');

      expect(inst.string[2].string).toBe('TEST_3');
      expect(inst.string[2].attribute.id).toBe('PROP_3');
    });

    test('Shouldn`t create user without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'PARENT'}).save();
      const inst = Object.assign(new User4stringEntity(), {string: 'VALUE', attribute});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create user without attribute', async () => {
      const parent = await Object.assign(new UserEntity(), {login: 'PARENT'}).save();
      const inst = Object.assign(new User4stringEntity(), {string: 'VALUE', parent});

      await expect(inst.save()).rejects.toThrow('attributeId');
    });

    test('Shouldn`t create user without string', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'PARENT'}).save();
      const parent = await Object.assign(new UserEntity(), {login: 'PARENT'}).save();
      const inst = Object.assign(new User4stringEntity(), {parent, attribute});

      await expect(inst.save()).rejects.toThrow('string');
    });
  });
});