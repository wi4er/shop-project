import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectoryEntity } from './model/directory.entity';
import { Directory2stringEntity } from './model/directory2string.entity';
import { PointEntity } from './model/point.entity';
import { Point2stringEntity } from './model/point2string.entity';
import { Directory2flagEntity } from './model/directory2flag.entity';
import { Point2flagEntity } from './model/point2flag.entity';
import { DirectoryController } from './controller/directory/directory.controller';
import { PointController } from './controller/point/point.controller';
import { Directory2pointEntity } from './model/directory2point.entity';
import { Point2pointEntity } from './model/point2point.entity';
import { PropertyEntity } from '../settings/model/property.entity';
import { LangEntity } from '../settings/model/lang.entity';
import { FlagEntity } from '../settings/model/flag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DirectoryEntity, Directory2stringEntity, Directory2flagEntity, Directory2pointEntity,
      PointEntity, Point2stringEntity, Point2flagEntity, Point2pointEntity,
      PropertyEntity,
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
