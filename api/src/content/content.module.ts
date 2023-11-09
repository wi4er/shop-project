import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElementEntity } from './model/element.entity';
import { Element2sectionEntity } from './model/element2section.entity';
import { SectionEntity } from './model/section.entity';
import { Element2stringEntity } from './model/element2string.entity';
import { BlockEntity } from './model/block.entity';
import { Block2stringEntity } from './model/block2string.entity';
import { Element2pointEntity } from './model/element2point.entity';
import { Section2pointEntity } from './model/section2point.entity';
import { Section2stringEntity } from './model/section2string.entity';
import { Element2elementEntity } from './model/element2element.entity';
import { PropertyEntity } from '../property/model/property.entity';
import { LangEntity } from '../lang/model/lang.entity';
import { BlockController } from './controller/block/block.controller';
import { ElementController } from './controller/element/element.controller';
import { Element2flagEntity } from './model/element2flag.entity';
import { SectionController } from './controller/section/section.controller';
import { Section2flagEntity } from './model/section2flag.entity';
import { Block2flagEntity } from './model/block2flag.entity';
import { ElementService } from './service/element/element.service';
import { SectionService } from './service/section/section.service';
import { BlockService } from './service/block/block.service';
import { BlockPermissionEntity } from './model/block-permission.entity';
import { UserEntity } from '../user/model/user.entity';
import { UserGroupEntity } from '../user/model/user-group.entity';
import { Block2pointEntity } from './model/block2point.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ElementEntity, Element2sectionEntity, Element2stringEntity, Element2pointEntity, Element2elementEntity,
      Element2flagEntity,
      SectionEntity, Section2pointEntity, Section2stringEntity, Section2flagEntity,
      BlockEntity, Block2stringEntity, Block2flagEntity, Block2pointEntity, BlockPermissionEntity,
      UserEntity, UserGroupEntity,
      PropertyEntity,
      LangEntity,
    ]),
  ],
  providers: [
    ElementService, SectionService, BlockService,
  ],
  controllers: [ BlockController, ElementController, SectionController ],
})
export class ContentModule {
}
