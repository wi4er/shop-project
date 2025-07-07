import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FormEntity } from '../../../feedback/model/form/form.entity';
import { Form2fieldEntity } from '../../../feedback/model/form/form2field.entity';
import { FieldAsPointEntity } from './field-as-point.entity';

describe('DirectoryEntity field entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('DirectoryEntity field', () => {
    test('Should create registry field', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const field = await Object.assign(new Form2fieldEntity(), {id: 'DIRECTORY', form}).save();
      const inst = await Object.assign(new FieldAsPointEntity(), {field}).save();

      expect(inst.id).toBe(1);
      expect(inst.field.id).toBe('DIRECTORY');
    });
  });

  describe('Field with registry', () => {
    // test('Should create registry field', async () => {
    //   const fieldRepo = source.getRepository(Form2fieldEntity);
    //   const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
    //   const field = await Object.assign(new Form2fieldEntity(), {id: 'DIRECTORY', form}).save();
    //
    //   await Object.assign(new FieldAsPointEntity(), {field}).save();
    //
    //   const inst = await fieldRepo.findOne({
    //     where: {id: 'DIRECTORY'},
    //     relations: {
    //       asPoint: true,
    //     },
    //   });
    //
    //   expect(inst.asPoint.id).toBe(1);
    // });
  });
});