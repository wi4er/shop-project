import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FormEntity } from '../../../feedback/model/form/form.entity';
import { FieldAsStringEntity } from './field-as-string.entity';
import { Form2fieldEntity } from '../../../feedback/model/form/form2field.entity';

describe('String field entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('String field', () => {
    // test('Should create string field', async () => {
    //   const form = await Object.assign(new FormEntity(), {id: 'LEED'}).save();
    //   const field = await Object.assign(
    //     new Form2fieldEntity(),
    //     {id: 'NAME', form},
    //   ).save();
    //
    //   const inst = new FieldAsStringEntity();
    //   inst.field = field;
    //   inst.constraints = '123';
    //
    //   await inst.save();
    // });
    //
    // test('Shouldn`t create without field', async () => {
    //   const inst = new FieldAsStringEntity();
    //
    //   await expect(inst.save()).rejects.toThrow('fieldId');
    // });
  });

  describe('Field as string', () => {
    // test('Should create field as string', async () => {
    //   const fieldRepo = source.getRepository(Form2fieldEntity);
    //
    //   const form = await Object.assign(
    //     new FormEntity(),
    //     {id: 'LEED'},
    //   ).save();
    //   const field = await Object.assign(
    //     new Form2fieldEntity(),
    //     {id: 'NAME', form},
    //   ).save();
    //   await Object.assign(new FieldAsStringEntity(), {field}).save();
    //
    //   const inst = await fieldRepo.findOne({
    //     where: {id: 'LEED'},
    //     relations: {asString: true},
    //   });
    // });
  });
});