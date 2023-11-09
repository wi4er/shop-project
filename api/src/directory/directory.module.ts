import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectoryEntity } from './model/directory.entity';
import { Directory2stringEntity } from './model/directory2string.entity';
import { PointEntity } from './model/point.entity';
import { Point2stringEntity } from './model/point2string.entity';
import { PropertyEntity } from '../property/model/property.entity';
import { LangEntity } from '../lang/model/lang.entity';
import { Directory2flagEntity } from './model/directory2flag.entity';
import { Point2flagEntity } from './model/point2flag.entity';
import { FlagEntity } from '../flag/model/flag.entity';
import { DirectoryController } from './controller/directory/directory.controller';
import { PointController } from './controller/point/point.controller';
import { DirectoryService } from './service/directory/directory.service';
import { PointService } from './service/point/point.service';
import { Directory2pointEntity } from './model/directory2point.entity';
import { Point2pointEntity } from './model/point2point.entity';

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
    DirectoryService,
    PointService,
  ],
  controllers: [DirectoryController, PointController],
})
export class DirectoryModule {
}
