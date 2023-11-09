import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FlagEntity } from './flag.entity';
import { Flag2flagEntity } from './flag2flag.entity';

describe('Flag entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  describe('Flag with flag', () => {
    test('Should add item with flag', async () => {
      const repo = source.getRepository(FlagEntity);
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'CHILD'}).save();

      await Object.assign(new Flag2flagEntity(), {flag, parent}).save();

      const item = await repo.findOne({
        where: {id: 'ACTIVE'},
        relations: {flag: {flag: true}},
      });

      expect(item.id).toBe('ACTIVE');
      expect(item.flag[0].id).toBe(1);
      expect(item.flag[0].flag.id).toBe('CHILD');
    });

    test('Shouldn`t create flag with duplicate flag', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'CHILD'}).save();

      await Object.assign(new Flag2flagEntity(), {flag, parent}).save();

      await expect(
        Object.assign(new Flag2flagEntity(), {flag, parent}).save()
      ).rejects.toThrow();
    });
  });
});