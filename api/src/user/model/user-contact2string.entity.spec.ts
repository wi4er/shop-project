import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { PropertyEntity } from '../../property/model/property.entity';
import { UserContact2stringEntity } from './user-contact2string.entity';
import { UserContactEntity, UserContactType } from './user-contact.entity';

describe('Contact2string entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Contact2string fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(UserContact2stringEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new UserContact2stringEntity(), {string: 'VALUE', property}).save(),
      ).rejects.toThrow('parentId');
    });

    test('Shouldn`t create without property', async () => {
      const parent = await Object.assign(
        new UserContactEntity(),
        {id: 'mail', type: UserContactType.EMAIL},
      ).save();

      await expect(
        Object.assign(new UserContact2stringEntity(), {string: 'VALUE', parent}).save(),
      ).rejects.toThrow('propertyId');
    });
  });

  describe('UserContact with strings', () => {
    test('Should create contact with string', async () => {
      const repo = source.getRepository(UserContactEntity);
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(
        new UserContactEntity(),
        {id: 'NAME', type: UserContactType.EMAIL},
      ).save();

      await Object.assign(
        new UserContact2stringEntity(),
        {string: 'VALUE', parent, property},
      ).save();

      const inst = await repo.findOne({
        where: {id: 'NAME'},
        relations: {string: true},
      });

      expect(inst.string).toHaveLength(1);
      expect(inst.string[0].string).toBe('VALUE');
    });
  });
});