import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FormEntity } from '../model/form.entity';
import { FormUpdateOperation } from './form-update.operation';

describe('Form update operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Form update', () => {
    test('Should update', async () => {
      await Object.assign(new FormEntity(), {id: 'ORDER'}).save();

      const id = await new FormUpdateOperation(source.manager).save('ORDER', {
        id: 'ORDER',
        property: [],
        flag: [],
      })

      expect(id).toBe('ORDER');
    });
  });
});