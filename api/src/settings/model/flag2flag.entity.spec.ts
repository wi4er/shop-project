import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FlagEntity } from './flag.entity';
import { Flag2flagEntity } from './flag2flag.entity';
import { Flag2stringEntity } from './flag2string.entity';

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

  describe('Flag deletion', () => {
    test('Should delete flag after parent', async () => {
      const strRepo = source.getRepository(Flag2stringEntity);
      const flagRepo = source.getRepository(FlagEntity);

      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'CHILD'}).save();
      await Object.assign(new Flag2flagEntity(), {flag, parent}).save();

      await flagRepo.delete({id: 'CHILD'});

      expect(await strRepo.count()).toBe(0);
    });

    test('Should delete flag after flag', async () => {
      const strRepo = source.getRepository(Flag2stringEntity);
      const flagRepo = source.getRepository(FlagEntity);

      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'CHILD'}).save();
      await Object.assign(new Flag2flagEntity(), {flag, parent}).save();

      await flagRepo.delete({id: 'ACTIVE'});

      expect(await strRepo.count()).toBe(0);
    })
  });
});