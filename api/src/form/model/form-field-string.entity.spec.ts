import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FormEntity } from './form.entity';
import { FormFieldStringEntity } from './form-field-string.entity';
import { FormFieldEntity } from './form-field.entity';

describe('String field entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('String field', () => {
    test('Should create string field', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'LEED'}).save();
      const field = await Object.assign(
        new FormFieldEntity(),
        {id: 'NAME', form},
      ).save();

      const inst = new FormFieldStringEntity();
      inst.field = field;
      inst.constraints = '123';

      await inst.save();
    });

    test('Shouldn`t create without field', async () => {
      const inst = new FormFieldStringEntity();

      await expect(inst.save()).rejects.toThrow('fieldId');
    });
  });

  describe('Field as string', () => {
    test('Should create field as string', async () => {
      const fieldRepo = source.getRepository(FormFieldEntity);

      const form = await Object.assign(
        new FormEntity(),
        {id: 'LEED'},
      ).save();
      const field = await Object.assign(
        new FormFieldEntity(),
        {id: 'NAME', form},
      ).save();
      await Object.assign(new FormFieldStringEntity(), {field}).save();

      const inst = await fieldRepo.findOne({
        where: {id: 'LEED'},
        relations: {asString: true},
      });

      console.log(inst);
    });
  });
});