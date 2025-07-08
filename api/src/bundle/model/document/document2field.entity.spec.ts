import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../../createConnectionOptions';
import { DocumentEntity } from './document.entity';
import { Document2fieldEntity } from './document2field.entity';
import { FieldEntity } from '../../../settings/model/field/field.entity';

describe('Document to field entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Document to field fields', () => {
    test('Should add item', async () => {
      const field = await Object.assign(new FieldEntity(), {id: 'NAME'}).save();
      const parent = await new DocumentEntity().save();

      const inst = new Document2fieldEntity();
      inst.field = field;
      inst.parent = parent;
      await inst.save();

      expect(inst.field.id).toBe('NAME');
      expect(inst.parent.id).toHaveLength(36);
    });

    test('Shouldn`t add without field item', async () => {
      const parent = await new DocumentEntity().save();

      const inst = new Document2fieldEntity();
      inst.parent = parent;
      await expect(inst.save()).rejects.toThrow('fieldId');
    });

    test('Shouldn`t add without parent', async () => {
      const field = await Object.assign(new FieldEntity(), {id: 'NAME'}).save();

      const inst = new Document2fieldEntity();
      inst.field = field;
      await expect(inst.save()).rejects.toThrow('parentId');
    });
  });
});