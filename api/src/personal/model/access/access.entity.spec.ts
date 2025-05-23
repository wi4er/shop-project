import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AccessEntity } from './access.entity';
import { AccessTarget } from './access-target';
import { AccessMethod } from './access-method';
import { GroupEntity } from '../group/group.entity';

describe('Access entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  function createAccess(): Promise<AccessEntity> & any {
    const item = new AccessEntity();

    item.target = AccessTarget.DIRECTORY;
    item.method = AccessMethod.GET;

    return Object.assign(Promise.resolve({
      then: resolve => resolve(item.save()),
    }), {
      withTarget(target: AccessTarget) {
        item.target = target;
        return this;
      },
      withMethod(method: AccessMethod) {
        item.method = method;
        return this;
      },
      withGroup(group: GroupEntity) {
        item.group = group;
        return this;
      },
    });
  }

  describe('Access fields', () => {
    test('Should create item', async () => {
      const inst = await createAccess();

      expect(inst.target).toBe('DIRECTORY');
      expect(inst.method).toBe('GET');
    });

    test('Should create with target and method', async () => {
      const inst = await createAccess()
        .withTarget(AccessTarget.ATTRIBUTE)
        .withMethod(AccessMethod.DELETE);

      expect(inst.target).toBe('ATTRIBUTE');
      expect(inst.method).toBe('DELETE');
    });

    test('Shouldn`t create with wrong target', async () => {
      const inst = Object.assign(
        new AccessEntity(),
        {target: 'WRONG', method: 'GET'},
      );

      await expect(inst.save()).rejects.toThrow('target');
    });

    test('Shouldn`t create with wrong method', async () => {
      const inst = Object.assign(
        new AccessEntity(),
        {target: 'ATTRIBUTE', method: 'WRONG'},
      );

      await expect(inst.save()).rejects.toThrow('method');
    });

    test('Shouldn`t create with wrong group', async () => {
      const inst = Object.assign(
        new AccessEntity(),
        {target: 'ATTRIBUTE', method: 'GET', group: 'WRONG'},
      );

      await expect(inst.save()).rejects.toThrow('violates foreign key constraint');
    });
  });

  describe('Access indexes', () => {
    test('Shouldn`t create duplicate item', async () => {
      await createAccess();
      await expect(createAccess()).rejects.toThrow('duplicate key');
    });

    test('Should create with group', async () => {
      const inst = await createAccess()
        .withGroup(await Object.assign(new GroupEntity(), {id: 'GROUP'}).save());

      expect(inst.group.id).toBe('GROUP');
    });

    test('Shouldn`t create duplicate with group', async () => {
      const group = await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();

      await createAccess().withGroup(group);
      await expect(createAccess().withGroup(group)).rejects.toThrow('duplicate key');
    });

    test('Should create with and without group', async () => {
      const group = await Object.assign(new GroupEntity(), {id: 'GROUP'}).save();

      await createAccess().withGroup(group);
      await createAccess();
    });
  });
});