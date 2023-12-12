import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { BlockInsertOperation } from './block-insert.operation';
import { PropertyEntity } from '../../settings/model/property.entity';
import { LangEntity } from '../../settings/model/lang.entity';
import { PropertyStringInput } from '../../common/input/property-string.input';
import { DirectoryEntity } from '../../directory/model/directory.entity';
import { PointEntity } from '../../directory/model/point.entity';
import { PropertyPointInput } from '../../common/input/property-point.input';

describe('Block insert operation', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Block insert', () => {
    test('Should save', async () => {

      const id = await new BlockInsertOperation(source.manager).save({
        property: [],
        flag: [],
      });

      expect(id).toBe(1);
    });
  });

  describe('Block insert with string', () => {
    test('Should save with property', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const id = await new BlockInsertOperation(source.manager).save({
        property: [
          {property: 'NAME', string: 'VALUE'} as PropertyStringInput,
        ],
        flag: [],
      });

      expect(id).toBe(1);
    });

    test('Shouldn`t save with wrong property', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      await expect(
        new BlockInsertOperation(source.manager).save({
          property: [{property: 'WRONG', string: 'VALUE'} as PropertyStringInput],
          flag: [],
        }),
      ).rejects.toThrow('WRONG');
    });

    test('Shouldn`t save with wrong lang', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      await Object.assign(new LangEntity(), {id: 'EN'}).save();

      await expect(
        new BlockInsertOperation(source.manager).save({
          property: [
            {property: 'NAME', string: 'VALUE', lang: 'NO_LANG'} as PropertyStringInput,
          ],
          flag: [],
        }),
      ).rejects.toThrow('NO_LANG');
    });
  });

  describe('Block insert with point', () => {
    test('Should save with point', async () => {
      const directory = await Object.assign(
        new DirectoryEntity(),
        {id: 'CITY'},
      ).save();
      await Object.assign(new PointEntity(), {id: 'Paris', directory}).save();
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const id = await new BlockInsertOperation(source.manager).save({
        property: [
          {property: 'NAME', point: 'Paris'} as PropertyPointInput,
        ],
        flag: [],
      });

      expect(id).toBe(1);
    });

    test('Shouldn`t save without property', async () => {
      const directory = await Object.assign(
        new DirectoryEntity(),
        {id: 'CITY'},
      ).save();
      await Object.assign(new PointEntity(), {id: 'Paris', directory}).save();

      await expect(new BlockInsertOperation(source.manager).save({
        property: [
          {point: 'Paris'} as PropertyPointInput,
        ],
        flag: [],
      })).rejects.toThrow('Property id');
    });

    test('Shouldn`t save without point', async () => {
      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      await expect(new BlockInsertOperation(source.manager).save({
        property: [
          {property: 'NAME'} as PropertyPointInput,
        ],
        flag: [],
      })).rejects.toThrow('property type');
    });
  });
});