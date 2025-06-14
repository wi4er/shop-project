import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FormEntity } from './form.entity';
import { FormFieldEntity } from './form-field.entity';
import { FormFieldSectionEntity } from './form-field-section.entity';

describe('SectionEntity field entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('SectionEntity field', () => {
    test('Should create section field', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const field = await Object.assign(new FormFieldEntity(), {id: 'SECTION', form}).save();
      const inst = await Object.assign(new FormFieldSectionEntity(), {field}).save();

      expect(inst.id).toBe(1);
      expect(inst.field.id).toBe('SECTION');
    });
  });

  describe('Field with section', () => {
    test('Should create section field', async () => {
      const fieldRepo = source.getRepository(FormFieldEntity);

      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const field = await Object.assign(new FormFieldEntity(), {id: 'SECTION', form}).save();

      await Object.assign(new FormFieldSectionEntity(), {field}).save();

      const inst = await fieldRepo.findOne({
        where: {id: 'SECTION'},
      });

      expect(inst.id).toBe('SECTION');
    });
  });
});