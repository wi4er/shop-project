import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { PropertyEntity } from '../../settings/model/property.entity';
import { PropertyStringInput } from '../../common/input/property-string.input';
import { UserContactInsertOperation } from './user-contact-insert.operation';
import { UserContactType } from '../model/user-contact.entity';

describe('User contact insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Contact insert', () => {
    test('Should save', async () => {
      const id = await new UserContactInsertOperation(source.manager).save({
        id: '123',
        type: UserContactType.PHONE,
        property: [],
        flag: [],
      });

      expect(id).toBe('123');
    });

    test('Should save with property', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const id = await new UserContactInsertOperation(source.manager).save({
        id: '123',
        type: UserContactType.PHONE,
        property: [{
          property: 'NAME',
          string: 'VALUE',
        } as PropertyStringInput],
        flag: [],
      });

      expect(id).toBe('123');
    });
  });
});