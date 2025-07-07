import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Form2fieldEntity } from './form2field.entity';
import { FormEntity } from './form.entity';
import { FieldEntity } from '../../../settings/model/field/field.entity';

describe('Form field entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Form field fields', () => {
    test('Should get empty list', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const field = await Object.assign(new FieldEntity(), {id: 'DATA'}).save();
      const inst = new Form2fieldEntity();
      inst.id = 'ELEMENT';
      inst.parent = form;
      inst.field = field;

      await inst.save();

      expect(inst.id).toBe('ELEMENT');
      expect(inst.created_at).toBeDefined();
      expect(inst.updated_at).toBeDefined();
      expect(inst.deleted_at).toBeNull();
      expect(inst.version).toBe(1);
      expect(inst.parent.id).toBe('FORM');
    });
  });
});