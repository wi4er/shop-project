import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FormEntity } from '../../../feedback/model/form/form.entity';
import { Form2fieldEntity } from '../../../feedback/model/form/form2field.entity';
import { FieldAsElementEntity } from './field-as-element.entity';

describe('ElementEntity field entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('ElementEntity field', () => {
    test('Should create element field', async () => {
      // const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      // const field = await Object.assign(new Form2fieldEntity(), {id: 'ELEMENT', form}).save();
      // const inst = await Object.assign(new FieldAsElementEntity(), {field}).save();
      //
      // expect(inst.id).toBe(1);
      // expect(inst.field.id).toBe('ELEMENT');
    });
  });

  describe('Field with element', () => {
    test('Should create element field', async () => {
      // const fieldRepo = source.getRepository(Form2fieldEntity);
      // const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      // const field = await Object.assign(new Form2fieldEntity(), {id: 'ELEMENT', form}).save();
      //
      // await Object.assign(new FieldAsElementEntity(), {field}).save();
      //
      // const inst = await fieldRepo.findOne({
      //   where: {id: 'ELEMENT'},
      //   relations: {
      //     asElement: true,
      //   },
      // });
      //
      // expect(inst.asElement.id).toBe(1);
    });
  });
});