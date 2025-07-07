import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { FormEntity } from '../form/form.entity';
import { ResultEntity } from './result.entity';

describe('Result entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Result fields', () => {
    test('Should create result', async () => {
      const form = await Object.assign(new FormEntity(), {id: 'FORM'}).save();
      const result = await Object.assign(new ResultEntity(), {form}).save();

      expect(result.id).toBe(1);
      expect(result.form.id).toBe('FORM');
    });
  });
});