import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FlagEntity } from './flag.entity';
import { Flag4stringEntity } from './flag4string.entity';
import { PropertyEntity } from './property.entity';

describe('Flag string property entity', () => {
  let source: DataSource;

  beforeAll(async () => {
    source = await createConnection(createConnectionOptions());
  });

  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Flag property fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(FlagEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create flag with property', async () => {
      const repo = source.getRepository(FlagEntity);

      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await Object.assign(new Flag4stringEntity(), {
        string: 'Flag name',
        property: 'NAME',
        parent,
      }).save();

      const item = await repo.findOne({where: {id: 'ACTIVE'}, relations: {string: true}});

      expect(item['string']).toHaveLength(1);
      expect(item['string'][0]['id']).toBe(1);
    });

    test('Shouldn`t create without property', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = Object.assign(
        new Flag4stringEntity(),
        {string: 'Flag name', parent}
      );

      await expect(inst.save()).rejects.toThrow('propertyId')
    });

    test('Shouldn`t create without parent', async () => {
      const property = await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();

      const inst = Object.assign(
        new Flag4stringEntity(),
        {string: 'Flag name', property}
      );

      await expect(inst.save()).rejects.toThrow('parentId')
    });
  });

  describe('Flag deletion', () => {
    test('Should delete string after patent', async () => {
      const strRepo = source.getRepository(Flag4stringEntity);
      const propRepo = source.getRepository(PropertyEntity);

      const property =await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Flag4stringEntity(), {string: 'Flag name', property, parent}).save();

      await propRepo.delete({id: 'NAME'})

      expect(await strRepo.count()).toBe(0);
    });

    test('Should delete string after property', async () => {
      const propRepo = source.getRepository(PropertyEntity);
      const flagRepo = source.getRepository(FlagEntity);

      await Object.assign(new PropertyEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await Object.assign(new Flag4stringEntity(), {string: 'Flag name', property: 'NAME', parent}).save();

      await propRepo.delete({id: 'NAME'});
      const list = await flagRepo.find({relations: {string: true}});

      expect(list).toHaveLength(1);
      expect(list[0].string).toEqual([]);
    });
  })
});