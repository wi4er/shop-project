import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { ContactEntity, UserContactType } from '../model/contact.entity';
import { UserContactDeleteOperation } from './user-contact-delete.operation';

describe('Contact delete operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Contact delete', () => {
    test('Should delete', async () => {
      await Object.assign(new ContactEntity(), {id: 'mail', type: UserContactType.EMAIL}).save();
      const id = await new UserContactDeleteOperation(source.manager).save(['mail']);

      expect(id).toEqual(['mail']);
    });
  });
});