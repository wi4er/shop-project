import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AttributeEntity } from './attribute.entity';
import { AttributeAsElementEntity } from './attribute-as-element.entity';
import { BlockEntity } from '../../../content/model/block/block.entity';

describe('AttributeEntity as element entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Entity fields', () => {
    test('Should create and find instance', async () => {
      const parent = await Object.assign(new AttributeEntity(), {id: 'LOCATION'}).save();
      const block = await new BlockEntity('BLOCK').save();
      await Object.assign(new AttributeAsElementEntity(), {parent, block}).save();

      const repo = source.getRepository<AttributeEntity>(AttributeEntity);

      const inst = await repo.findOne({
        where: {id: 'LOCATION'},
        relations: {asElement: {block: true}},
      });

      expect(inst.asElement.block.id).toBe('BLOCK');
    });
  });
});