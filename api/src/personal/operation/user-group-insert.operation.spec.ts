import { DataSource } from "typeorm/data-source/DataSource";
import { createConnection } from "typeorm";
import { createConnectionOptions } from "../../createConnectionOptions";
import { UserGroupInsertOperation } from "./user-group-insert.operation";
import { GroupEntity } from "../model/group.entity";
import { FlagEntity } from '../../settings/model/flag.entity';

describe('UserGroup insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  test('Should insert', async () => {
    const operation = new UserGroupInsertOperation(source.manager)

    const id = await operation.save({
      parent: null,
      flag: [],
      property: [],
    });

    expect(id).toBe(1);
  });

  test('Should insert with flag', async () => {
    await Object.assign(new FlagEntity(), { id: 'ACTIVE' }).save();
    const operation = new UserGroupInsertOperation(source.manager)

    const id = await operation.save({
      parent: null,
      flag: [ 'ACTIVE' ],
      property: [],
    });

    expect(id).toBe(1);
  });

  test('Should insert with parent', async () => {
    await new GroupEntity().save();
    const operation = new UserGroupInsertOperation(source.manager)

    const id = await operation.save({
      parent: 1,
      flag: [],
      property: [],
    });

    expect(id).toBe(2);
  });
});