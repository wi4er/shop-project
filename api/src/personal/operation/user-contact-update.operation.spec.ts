import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FlagEntity } from '../../settings/model/flag.entity';
import { UserContactUpdateOperation } from './user-contact-update.operation';
import { ContactEntity, UserContactType } from '../model/contact.entity';

describe('User contact update operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));

  test('Should insert', async () => {
    await Object.assign(new ContactEntity(), {id: 'mail', type: UserContactType.EMAIL}).save();
    const operation = new UserContactUpdateOperation(source.manager)

    const id = await operation.save('mail', {
      id: 'mail',
      type: UserContactType.EMAIL,
      flag: [],
      property: [],
    });

    expect(id).toBe( 'mail');
  });

  test('Should update with flag', async () => {
    await Object.assign(new ContactEntity(), {id: 'mail', type: UserContactType.EMAIL}).save();
    await Object.assign(new FlagEntity(), { id: 'ACTIVE' }).save();
    const operation = new UserContactUpdateOperation(source.manager)

    const id = await operation.save('mail', {
      id: 'mail',
      type: UserContactType.EMAIL,
      flag: [ 'ACTIVE' ],
      property: [],
    });

    expect(id).toBe('mail');
  });
});