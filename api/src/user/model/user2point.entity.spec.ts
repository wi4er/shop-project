import { DataSource } from "typeorm/data-source/DataSource";
import { createConnection } from "typeorm";
import { createConnectionOptions } from "../../createConnectionOptions";
import { UserEntity } from "./user.entity";
import { PointEntity } from "../../directory/model/point.entity";
import { DirectoryEntity } from "../../directory/model/directory.entity";
import { User2pointEntity } from "./user2point.entity";
import { PropertyEntity } from '../../settings/model/property.entity';

describe('User entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  describe("User2point fields", () => {
    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new User2pointEntity(), {property, point});

      await expect(inst.save()).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const parent = await Object.assign(new UserEntity(), {login: 'user'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      const point = await Object.assign(new PointEntity(), {id: 'LONDON', directory}).save();

      const inst = Object.assign(new User2pointEntity(), {parent, point});

      await expect(inst.save()).rejects.toThrow('propertyId');
    });

    test('Shouldn`t create without point', async () => {
      const parent = await Object.assign(new UserEntity(), {login: 'user'}).save();
      const property = await Object.assign(new PropertyEntity(), {id: 'CURRENT'}).save();

      const inst = Object.assign(new User2pointEntity(), {parent, property});

      await expect(inst.save()).rejects.toThrow('pointId');
    });
  });

  describe("User points", () => {
    test('Should create user with value', async () => {
      const repo = source.getRepository(UserEntity);

      await Object.assign(new DirectoryEntity(), { id: 'CITY' }).save();
      await Object.assign(new PointEntity(), { id: 'LONDON', directory: 'CITY' }).save();
      await Object.assign(new PropertyEntity(), { id: 'CURRENT_CITY' }).save();
      const user = await Object.assign(new UserEntity(), { login: 'user' }).save();

      await Object.assign(new User2pointEntity(), { property: 'CURRENT_CITY', point: 'LONDON', parent: 1 }).save();

      const inst = await repo.findOne({ where: { id: user.id }, relations: { point: { point: { directory: true } } } });

      expect(inst.point[0].point.id).toBe('LONDON');
      expect(inst.point[0].point.directory.id).toBe('CITY');
    });

    test('Should create user with multi value', async () => {
      const repo = source.getRepository(UserEntity);

      await Object.assign(new DirectoryEntity(), { id: 'CITY' }).save();
      for (let i = 0; i < 10; i++) {
        await Object.assign(new PointEntity(), { id: `LONDON_${i}`, directory: 'CITY' }).save();
      }
      await Object.assign(new PropertyEntity(), { id: 'CURRENT_CITY' }).save();
      const user = await Object.assign(new UserEntity(), { login: 'user' }).save();

      await Object.assign(new User2pointEntity(), { property: 'CURRENT_CITY', point: 'LONDON_0', parent: 1 }).save();
      await Object.assign(new User2pointEntity(), { property: 'CURRENT_CITY', point: 'LONDON_3', parent: 1 }).save();
      await Object.assign(new User2pointEntity(), { property: 'CURRENT_CITY', point: 'LONDON_6', parent: 1 }).save();

      const inst = await repo.findOne({ where: { id: user.id }, relations: { point: true } });

      expect(inst.point).toHaveLength(3);
    });

    test('Shouldn`t create user with same value and property', async () => {
      await Object.assign(new DirectoryEntity(), { id: 'CITY' }).save();
      await Object.assign(new PointEntity(), { id: 'LONDON', directory: 'CITY' }).save();
      await Object.assign(new PropertyEntity(), { id: 'CURRENT_CITY' }).save();
      await Object.assign(new UserEntity(), { login: 'user' }).save();

      await Object.assign(new User2pointEntity(), { property: 'CURRENT_CITY', point: 'LONDON', parent: 1 }).save();
      const wrong = Object.assign(new User2pointEntity(), {
        property: 'CURRENT_CITY',
        point: 'LONDON',
        parent: 1
      });

      await expect(wrong.save()).rejects.toThrow('duplicate key value violates unique constraint');
    });
  });
});