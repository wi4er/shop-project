import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { AttributeEntity, AttributeType } from './attribute.entity';
import { BlockEntity } from '../../content/model/block/block.entity';
import { AttributeAsSectionEntity } from './attribute-as-section.entity';

describe('Attribute as section entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Entity fields', () => {
    test('Should create and find instance', async () => {
      const parent = await Object.assign(
        new AttributeEntity(),
        {id: 'LOCATION', type: AttributeType.SECTION},
      ).save();
      const block = await Object.assign(new BlockEntity(), {}).save();
      await Object.assign(new AttributeAsSectionEntity(), {parent, block}).save();

      const repo = source.getRepository<AttributeEntity>(AttributeEntity);

      const inst = await repo.findOne({
        where: {id: 'LOCATION'},
        relations: {asSection: {block: true}},
      });

      expect(inst.asSection.block.id).toBe(1);
    });
  });
});