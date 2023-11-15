import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FlagEntity } from '../../flag/model/flag.entity';
import { Form2flagEntity } from './form2flag.entity';
import { FormEntity } from './form.entity';

describe('Form2flag entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Form2flag fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Form2flagEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create form flag', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'NAME'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const inst = await Object.assign(new Form2flagEntity(), {flag, parent}).save();

      expect(inst.id).toBe(1);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Shouldn`t create without flag', async () => {
      const parent = await Object.assign(new FormEntity(), {id: 'NAME'}).save();
      const inst = Object.assign(new Form2flagEntity(), {parent});

      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t create without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const inst = Object.assign(new Form2flagEntity(), {flag});

      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });

  describe('Form with flag', () => {
    test('Should create form with flag', async () => {
      const formRepo = source.getRepository(FormEntity);

      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const parent = await Object.assign(new FormEntity(), {id: 'VALUE'}).save();
      await Object.assign(new Form2flagEntity(), {parent, flag}).save();

      const inst = await formRepo.findOne({
        where: {id: 'VALUE'},
        relations: {flag: {flag: true}},
      });

      expect(inst.flag).toHaveLength(1);
      expect(inst.flag[0].flag.id).toBe('ACTIVE');
    });

    test('Should create with many flags', async () => {
      const formRepo = source.getRepository(FormEntity);
      const parent = await Object.assign(new FormEntity(), {id: 'VALUE'}).save();

      {
        const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
        await Object.assign(new Form2flagEntity(), {parent, flag}).save();
      }

      {
        const flag = await Object.assign(new FlagEntity(), {id: 'PASSIVE'}).save();
        await Object.assign(new Form2flagEntity(), {parent, flag}).save();
      }

      const inst = await formRepo.findOne({
        where: {id: 'VALUE'},
        relations: {flag: {flag: true}},
      });

      expect(inst.flag).toHaveLength(2);
      expect(inst.flag[0].flag.id).toBe('ACTIVE');
      expect(inst.flag[1].flag.id).toBe('PASSIVE');
    });
  });
});