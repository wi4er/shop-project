import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { LangUpdateOperation } from './lang-update.operation';
import { LangEntity } from '../model/lang.entity';

describe('Lang update operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Lang update', () => {
    test('Should save', async () => {
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const id = await new LangUpdateOperation(source.manager).save('EN', {
        id: 'EN',
        flag: [],
        property: [],
      });

      expect(id).toBe('EN');
    });
  });
});