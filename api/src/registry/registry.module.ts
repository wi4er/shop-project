import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectoryEntity } from './model/directory/directory.entity';
import { Directory4stringEntity } from './model/directory/directory4string.entity';
import { PointEntity } from './model/point/point.entity';
import { Point4stringEntity } from './model/point/point4string.entity';
import { Directory2flagEntity } from './model/directory/directory2flag.entity';
import { Point2flagEntity } from './model/point/point2flag.entity';
import { DirectoryController } from './controller/directory/directory.controller';
import { PointController } from './controller/point/point.controller';
import { Directory4pointEntity } from './model/directory/directory4point.entity';
import { Point4pointEntity } from './model/point/point4point.entity';
import { AttributeEntity } from '../settings/model/attribute/attribute.entity';
import { LangEntity } from '../settings/model/lang/lang.entity';
import { FlagEntity } from '../settings/model/flag/flag.entity';
import { Directory2permissionEntity } from './model/directory/directory2permission.entity';
import { RegistryLogController } from './controller/registry-log/registry-log.controller';
import { Directory2logEntity } from './model/directory/directory2log.entity';
import { Point2logEntity } from './model/point/point2log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DirectoryEntity,
      Directory4stringEntity, Directory4pointEntity,
      Directory2flagEntity, Directory2permissionEntity, Directory2logEntity,
      PointEntity,
      Point2flagEntity, Point2logEntity,
      Point4stringEntity, Point4pointEntity,
      AttributeEntity, LangEntity, FlagEntity,
    ]),
  ],
  providers: [
  ],
  controllers: [DirectoryController, PointController, RegistryLogController],
})
export class RegistryModule {
}
