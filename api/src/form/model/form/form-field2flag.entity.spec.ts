import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FormEntity } from './form.entity';
import { FormField2flagEntity } from './form-field2flag.entity';
import { FormFieldEntity } from './form-field.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

describe('FormField2flag entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('FormField2flag fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(FormField2flagEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create form field flag', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'LEED'}).save();
      const parent = await Object.assign(new FormFieldEntity(), {id: 'NAME', form}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const inst = await Object.assign(new FormField2flagEntity(), {flag, parent}).save();

      expect(inst.id).toBe(1);
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
    });

    test('Shouldn`t create without flag', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'LEED'}).save();
      const parent = await Object.assign(new FormFieldEntity(), {id: 'NAME', form}).save();
      const inst = Object.assign(new FormField2flagEntity(), {parent});

      await expect(inst.save()).rejects.toThrow('flagId');
    });

    test('Shouldn`t create without parent', async () => {
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const inst = Object.assign(new FormField2flagEntity(), {flag});

      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });

  describe('FormField with flag', () => {
    test('Should create form with flag', async () => {
      const fieldRepo = source.getRepository(FormFieldEntity);

      const form = await Object.assign(new FormEntity(), {id: 'LEED'}).save();
      const flag = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      const parent = await Object.assign(new FormFieldEntity(), {id: 'VALUE', form}).save();
      await Object.assign(new FormField2flagEntity(), {parent, flag}).save();

      const inst = await fieldRepo.findOne({
        where: {id: 'VALUE'},
        relations: {flag: {flag: true}},
      });

      expect(inst.flag).toHaveLength(1);
      expect(inst.flag[0].flag.id).toBe('ACTIVE');
    });
  });
});