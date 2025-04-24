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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DirectoryEntity, Directory4stringEntity, Directory2flagEntity, Directory4pointEntity,
      PointEntity, Point4stringEntity, Point2flagEntity, Point4pointEntity,
      AttributeEntity,
      LangEntity,
      FlagEntity,
    ]),
  ],
  providers: [
  ],
  controllers: [DirectoryController, PointController],
})
export class DirectoryModule {
}
