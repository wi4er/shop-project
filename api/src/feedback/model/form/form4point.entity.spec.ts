import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { Form4pointEntity } from './form4point.entity';
import { FormEntity } from './form.entity';
import { AttributeEntity, AttributeType } from '../../../settings/model/attribute/attribute.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';

describe('Form for point entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Form point fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(Form4pointEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create point attribute', async () => {
      const value = new Form4pointEntity();
      value.point = await Object.assign(
        new PointEntity(),
        {id: 'ITEM', directory: await Object.assign(new DirectoryEntity(), {id: 'LIST'}).save()}
      ).save();
      value.attribute = await Object.assign(
        new AttributeEntity(),
        {id: 'PROPERTY', type: AttributeType.POINT},
      ).save();
      value.parent = await Object.assign(new FormEntity(), {id: 'FORM'}).save();

      const inst = await value.save();

      expect(inst.id).toBe(1);
      expect(inst.point.id).toBe('ITEM');
    });
  });
});