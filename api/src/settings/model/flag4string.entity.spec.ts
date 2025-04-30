import { DataSource } from 'typeorm/data-source/DataSource';
import { createConnection } from 'typeorm';
import { createConnectionOptions } from '../../createConnectionOptions';
import { FlagEntity } from './flag.entity';
import { Flag4stringEntity } from './flag4string.entity';
import { AttributeEntity } from './attribute.entity';

describe('Flag string attribute entity', () => {
  let source: DataSource;

  beforeAll(async () => source = await createConnection(createConnectionOptions()));
  beforeEach(() => source.synchronize(true));
  afterAll(() => source.destroy());

  describe('Flag attribute fields', () => {
    test('Should get empty list', async () => {
      const repo = source.getRepository(FlagEntity);
      const list = await repo.find();

      expect(list).toHaveLength(0);
    });

    test('Should create flag with attribute', async () => {
      const repo = source.getRepository(FlagEntity);

      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await Object.assign(new Flag4stringEntity(), {
        string: 'Flag name',
        attribute: 'NAME',
        parent,
      }).save();

      const item = await repo.findOne({where: {id: 'ACTIVE'}, relations: {string: true}});

      expect(item['string']).toHaveLength(1);
      expect(item['string'][0]['id']).toBe(1);
    });

    test('Shouldn`t create without attribute', async () => {
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      const inst = Object.assign(
        new Flag4stringEntity(),
        {string: 'Flag name', parent}
      );

      await expect(inst.save()).rejects.toThrow('attributeId')
    });

    test('Shouldn`t create without parent', async () => {
      const attribute = await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();

      const inst = Object.assign(
        new Flag4stringEntity(),
        {string: 'Flag name', property: attribute}
      );

      await expect(inst.save()).rejects.toThrow('parentId')
    });
  });

  describe('Flag deletion', () => {
    test('Should delete string after patent', async () => {
      const strRepo = source.getRepository(Flag4stringEntity);
      const propRepo = source.getRepository(AttributeEntity);

      const attribute =await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();
      await Object.assign(new Flag4stringEntity(), {string: 'Flag name', attribute, parent}).save();

      await propRepo.delete({id: 'NAME'})

      expect(await strRepo.count()).toBe(0);
    });

    test('Should delete string after attribute', async () => {
      const propRepo = source.getRepository(AttributeEntity);
      const flagRepo = source.getRepository(FlagEntity);

      await Object.assign(new AttributeEntity(), {id: 'NAME'}).save();
      const parent = await Object.assign(new FlagEntity(), {id: 'ACTIVE'}).save();

      await Object.assign(new Flag4stringEntity(), {string: 'Flag name', attribute: 'NAME', parent}).save();

      await propRepo.delete({id: 'NAME'});
      const list = await flagRepo.find({relations: {string: true}});

      expect(list).toHaveLength(1);
      expect(list[0].string).toEqual([]);
    });
  })
});