import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { PropertyEntity } from './property.entity';
import { FlagEntity } from '../../flag/model/flag.entity';
import { Property2flagEntity } from './property2flag.entity';

describe('Property2flag entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Property2flag fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Property2flagEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create property flag', async () => {
      const parent = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const inst = await Object.assign(new Property2flagEntity(), {flag, parent}).save();

      expect(inst.id).toBe(1);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Shouldn`t create without flag', async () => {
      const parent = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const inst = Object.assign(new Property2flagEntity(), {parent});

      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t create without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const inst = Object.assign(new Property2flagEntity(), {flag});

      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });

  describe('Property with flag', () => {
    test('Should create property with flag', async () => {
      const propRepo = source.getRepository(PropertyEntity);

      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const parent = await Object.assign(new PropertyEntity(), {id: 'VALUE'}).save();
      await Object.assign(new Property2flagEntity(), {parent, flag}).save();

      const inst = await propRepo.findOne({
        where: {id: 'VALUE'},
        relations: {flag: {flag: true}},
      });

      expect(inst.flag).toHaveLength(1);
      expect(inst.flag[0].flag.id).toBe('ACTIVE');
    });

    test('Should create with many flags', async () => {
      const propRepo = source.getRepository(PropertyEntity);
      const parent = await Object.assign(new PropertyEntity(), {id: 'VALUE'}).save();

      {
        const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
        await Object.assign(new Property2flagEntity(), {parent, flag}).save();
      }

      {
        const flag = await Object.assign(new FlagEntity(), {id: 'PASSIVE'}).save();
        await Object.assign(new Property2flagEntity(), {parent, flag}).save();
      }

      const inst = await propRepo.findOne({
        where: {id: 'VALUE'},
        relations: {flag: {flag: true}},
      });

      expect(inst.flag).toHaveLength(2);
      expect(inst.flag[0].flag.id).toBe('ACTIVE');
      expect(inst.flag[1].flag.id).toBe('PASSIVE');
    });
  });
});