import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { UserEntity } from './user.entity';
import { ContactEntity, UserContactType } from '../contact/contact.entity';
import { User2contactEntity } from './user2contact.entity';

describe('User Contact entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('User with contacts', () => {
    test('Should create user with contact', async () => {
      const repo = source.getRepository(UserEntity);
      const parent = await Object.assign(new UserEntity(), {id: 'user', login: 'user'}).save();
      const contact = await Object.assign(
        new ContactEntity(),
        {id: 'mail', type: UserContactType.EMAIL},
      ).save();

      await Object.assign(new User2contactEntity(), {
        parent,
        contact,
        value: 'mail@mail.com',
        verifyCode: '',
      }).save();

      const res = await repo.findOne({
        where: {id: 'user'},
        relations: {contact: true},
      });

      expect(res.contact).toHaveLength(1);
      expect(res.contact[0].value).toBe('mail@mail.com');
    });
  });
});