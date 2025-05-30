import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectoryEntity } from './model/directory.entity';
import { Directory4stringEntity } from './model/directory4string.entity';
import { PointEntity } from './model/point.entity';
import { Point4stringEntity } from './model/point4string.entity';
import { Directory2flagEntity } from './model/directory2flag.entity';
import { Point2flagEntity } from './model/point2flag.entity';
import { DirectoryController } from './controller/directory/directory.controller';
import { PointController } from './controller/point/point.controller';
import { Directory4pointEntity } from './model/directory4point.entity';
import { Point4pointEntity } from './model/point4point.entity';
import { AttributeEntity } from '../settings/model/attribute.entity';
import { LangEntity } from '../settings/model/lang.entity';
import { FlagEntity } from '../settings/model/flag.entity';
import { Directory2permissionEntity } from './model/directory2permission.entity';
import { RegistryLogController } from './controller/registry-log/registry-log.controller';
import { Directory2logEntity } from './model/directory2log.entity';
import { Point2logEntity } from './model/point2log.entity';

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
