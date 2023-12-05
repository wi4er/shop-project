import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { LangDeleteOperation } from './lang-delete.operation';
import { LangEntity } from '../model/lang.entity';

describe('Lang delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Flag delete', () => {
    test('Should delete', async () => {
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      const id = await new LangDeleteOperation(source.manager).save(['EN']);

      expect(id).toEqual(['EN']);
    });
  });
});