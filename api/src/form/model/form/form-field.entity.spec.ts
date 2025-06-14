import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FormFieldEntity, FormFieldType } from './form-field.entity';
import { FormEntity } from './form.entity';

describe('Form field entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Form field fields', () => {
    test('Should get empty list', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const inst = new FormFieldEntity();
      inst.id = 'ELEMENT';
      inst.form = form;
      inst.type = FormFieldType.ELEMENT;
      inst.required = true;

      await inst.save();

      expect(inst.id).toBe('ELEMENT');
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
      expect(inst.form.id).toBe('FORM');
    });

    test('Should have default value for required', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const inst = await Object.assign(
        new FormFieldEntity(),
        {id: 'NAME', form},
      ).save();

      expect(inst.required).toBeFalsy();
    });

    test('Should have default value for type', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const inst = await Object.assign(
        new FormFieldEntity(),
        {id: 'NAME', form},
      ).save();

      expect(inst.type).toBe('STRING');
    });
  });
});