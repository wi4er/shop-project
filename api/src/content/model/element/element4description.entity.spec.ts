import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { BlockEntity } from '../block/block.entity';
import { ElementEntity } from './element.entity';
import { Element4descriptionEntity } from './element4description.entity';

describe('Element for description entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element for description fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Element4descriptionEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      await expect(
        Object.assign(new Element4descriptionEntity(), {description: 'VALUE', property}).save(),
      ).rejects.toThrow();
    });

    test('Shouldn`t create without attribute', async () => {
      const block = await new BlockEntity().save();
      const parent = await Object.assign(new ElementEntity(), {id: 'NAME', block}).save();

      await expect(
        Object.assign(new Element4descriptionEntity(), {description: 'VALUE', parent}).save(),
      ).rejects.toThrow();
    });
  });

  describe('Element with description', () => {
    test('Should create element with description', async () => {
      const repo = source.getRepository(ElementEntity);

      const block = await new BlockEntity().save();
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(
        new ElementEntity(),
        {id: 'NAME', block},
      ).save();

      await Object.assign(new Element4descriptionEntity(), {description: 'VALUE', parent, attribute}).save();

      const inst = await repo.findOne({
        where: {id: parent.id},
        relations: {description: true},
      });

      expect(inst.description).toHaveLength(1);
      expect(inst.description[0].description).toBe('VALUE');
    });
  });
});