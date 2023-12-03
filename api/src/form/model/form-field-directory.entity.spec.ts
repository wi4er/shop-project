import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FormEntity } from './form.entity';
import { FormFieldEntity } from './form-field.entity';
import { FormFieldDirectoryEntity } from './form-field-directory.entity';

describe('Directory field entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Directory field', () => {
    test('Should create directory field', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const field = await Object.assign(new FormFieldEntity(), {id: 'DIRECTORY', form}).save();
      const inst = await Object.assign(new FormFieldDirectoryEntity(), {field}).save();

      expect(inst.id).toBe(1);
      expect(inst.field.id).toBe('DIRECTORY');
    });
  });

  describe('Field with directory', () => {
    test('Should create directory field', async () => {
      const fieldRepo = source.getRepository(FormFieldEntity);
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const field = await Object.assign(new FormFieldEntity(), {id: 'DIRECTORY', form}).save();

      await Object.assign(new FormFieldDirectoryEntity(), {field}).save();

      const inst = await fieldRepo.findOne({
        where: {id: 'DIRECTORY'},
        relations: {
          asDirectory: true,
        },
      });

      expect(inst.asDirectory.id).toBe(1);
    });
  });
});