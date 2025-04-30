import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { AttributeEntity, AttributeType } from './attribute.entity';
import { DirectoryEntity } from '../../directory/model/directory.entity';
import { AttributeAsPointEntity } from './attribute-as-point.entity';

describe('Attribute as directory entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Entity fields', () => {
    test('Should create and find instance', async () => {
      const parent = await Object.assign(new AttributeEntity(), {id: 'LOCATION'}).save();
      const directory = await Object.assign(new DirectoryEntity(), {id: 'CITY'}).save();
      await Object.assign(new AttributeAsPointEntity(), {parent, directory}).save();

      const repo = source.getRepository<AttributeEntity>(AttributeEntity);

      const inst = await repo.findOne({
        where: {id: 'LOCATION'},
        relations: {asDirectory: {directory: true}},
      });

      expect(inst.asDirectory.directory.id).toBe('CITY')
    });
  });
});