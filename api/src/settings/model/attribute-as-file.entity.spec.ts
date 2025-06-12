import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { AttributeEntity } from './attribute.entity';
import { AttributeAsFileEntity } from './attribute-as-file.entity';
import { CollectionEntity } from '../../storage/model/collection.entity';

describe('AttributeEntity as file entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Entity fields', () => {
    test('Should create and find instance', async () => {
      const parent = await Object.assign(new AttributeEntity(), {id: 'LOCATION'}).save();
      const collection = await Object.assign(new CollectionEntity(), {id: 'PREVIEW'}).save();
      await Object.assign(new AttributeAsFileEntity(), {parent, collection}).save();

      const repo = source.getRepository<AttributeEntity>(AttributeEntity);

      const inst = await repo.findOne({
        where: {id: 'LOCATION'},
        relations: {asFile: {collection: true}},
      });

      expect(inst.asFile.collection.id).toBe('PREVIEW')
    });
  });
});