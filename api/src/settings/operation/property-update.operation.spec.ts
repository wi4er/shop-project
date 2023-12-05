import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FlagEntity } from '../model/flag.entity';
import { LangUpdateOperation } from './lang-update.operation';
import { PropertyEntity } from '../model/property.entity';
import { PropertyUpdateOperation } from './property-update.operation';

describe('Lang update operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Lang update', () => {
    test('Should save', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const id = await new PropertyUpdateOperation(source.manager).save('NAME', {
        id: 'NAME',
        flag: [],
        property: [],
      });

      expect(id).toBe('NAME');
    });
  });
});