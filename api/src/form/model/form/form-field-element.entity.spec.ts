import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FormEntity } from './form.entity';
import { FormFieldEntity } from './form-field.entity';
import { FormFieldElementEntity } from './form-field-element.entity';

describe('ElementEntity field entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('ElementEntity field', () => {
    test('Should create element field', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const field = await Object.assign(new FormFieldEntity(), {id: 'ELEMENT', form}).save();
      const inst = await Object.assign(new FormFieldElementEntity(), {field}).save();

      expect(inst.id).toBe(1);
      expect(inst.field.id).toBe('ELEMENT');
    });
  });

  describe('Field with element', () => {
    test('Should create element field', async () => {
      const fieldRepo = source.getRepository(FormFieldEntity);
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const field = await Object.assign(new FormFieldEntity(), {id: 'ELEMENT', form}).save();

      await Object.assign(new FormFieldElementEntity(), {field}).save();

      const inst = await fieldRepo.findOne({
        where: {id: 'ELEMENT'},
        relations: {
          asElement: true,
        },
      });

      expect(inst.asElement.id).toBe(1);
    });
  });
});