import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { UserEntity } from './user.entity';
import { User4userEntity } from './user4user.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';

describe('User user attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('User attribute fields', () => {
    test('Should create user with user', async () => {
      const repo = source.getRepository(UserEntity);

      await Object.assign(new AttributeEntity(), {id: 'PARENT'}).save();
      const child = await Object.assign(new UserEntity(), {login: 'child'}).save();
      const parent = await Object.assign(new UserEntity(), {login: 'PARENT'}).save();

      await Object.assign(new User4userEntity(), {
        user: child,
        attribute: 'PARENT',
        parent,
      }).save();

      const inst = await repo.findOne({
        where: {id: parent.id},
        relations: {child: true},
      });

      expect(inst.child).toHaveLength(1);
      expect(inst.child[0].id).toBe(1);
    });

    test('Shouldn`t create user without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'PARENT'}).save();
      const user = await Object.assign(new UserEntity(), {login: 'child'}).save();

      const inst = Object.assign(
        new User4userEntity(),
        {user, attribute},
      );

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create user without attribute', async () => {
      const user = await Object.assign(new UserEntity(), {login: 'child'}).save();
      const parent = await Object.assign(new UserEntity(), {login: 'PARENT'}).save();

      const inst = Object.assign(
        new User4userEntity(),
        {user, parent},
      );

      await expect(inst.save()).rejects.toThrow('attributeId');
    });

    test('Shouldn`t create user without user', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'PARENT'}).save();
      const parent = await Object.assign(new UserEntity(), {login: 'PARENT'}).save();

      const inst = Object.assign(
        new User4userEntity(),
        {parent, attribute},
      );

      await expect(inst.save()).rejects.toThrow('userId');
    });

    test('Shouldn`t create user duplicate user', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'PARENT'}).save();
      const user = await Object.assign(new UserEntity(), {login: 'child'}).save();
      const parent = await Object.assign(new UserEntity(), {login: 'PARENT'}).save();

      await Object.assign(new User4userEntity(), {user, attribute, parent}).save();

      await expect(
        Object.assign(new User4userEntity(), {user, attribute, parent}).save(),
      ).rejects.toThrow('duplicate key value violates unique constraint');
    });
  });
});