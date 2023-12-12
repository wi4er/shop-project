import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockEntity } from '../model/block.entity';
import { ElementEntity } from '../model/element.entity';
import { Element4elementInsertOperation } from './element4element-insert.operation';
import { PropertyEntity } from '../../settings/model/property.entity';

describe('Element element property operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Element property insert', () => {
    test('Should save', async () => {
      const repo = source.manager.getRepository(ElementEntity);
      const block = await Object.assign(new BlockEntity(), {}).save();
      const element = await Object.assign(new ElementEntity(), {block}).save();
      const link = await Object.assign(new ElementEntity(), {block}).save();
      await Object.assign(new PropertyEntity(), {id: 'CHILD'}).save();

      await new Element4elementInsertOperation(source.manager).save(
        element,
        [{
          property: 'CHILD',
          element: link.id,
        }],
      );

      const inst = await repo.findOne({
        where: {id: 1},
        relations: {element: {element: true}}
      });

      expect(inst.element).toHaveLength(1);
      expect(inst.element[0].element.id).toBe(2)
    });
  });
});