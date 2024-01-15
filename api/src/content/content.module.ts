import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElementEntity } from './model/element.entity';
import { Element2sectionEntity } from './model/element2section.entity';
import { SectionEntity } from './model/section.entity';
import { Element4stringEntity } from './model/element4string.entity';
import { BlockEntity } from './model/block.entity';
import { Block4stringEntity } from './model/block4string.entity';
import { Element4pointEntity } from './model/element4point.entity';
import { Section4pointEntity } from './model/section4point.entity';
import { Section4stringEntity } from './model/section4string.entity';
import { Element4elementEntity } from './model/element4element.entity';
import { BlockController } from './controller/block/block.controller';
import { ElementController } from './controller/element/element.controller';
import { Element2flagEntity } from './model/element2flag.entity';
import { SectionController } from './controller/section/section.controller';
import { Section2flagEntity } from './model/section2flag.entity';
import { Block2flagEntity } from './model/block2flag.entity';
import { Block2permissionEntity } from './model/block2permission.entity';
import { UserEntity } from '../personal/model/user.entity';
import { GroupEntity } from '../personal/model/group.entity';
import { Block4pointEntity } from './model/block4point.entity';
import { PropertyEntity } from '../settings/model/property.entity';
import { LangEntity } from '../settings/model/lang.entity';
import { Element2permissionEntity } from './model/element2permission.entity';
import { Section2permissionEntity } from './model/section2permission.entity';
import { Element4sectionEntity } from './model/element4section.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ElementEntity, Element2sectionEntity, Element4stringEntity, Element4pointEntity,
      Element4elementEntity, Element4sectionEntity,
      Element2flagEntity, Element2permissionEntity,
      SectionEntity, Section4pointEntity, Section4stringEntity, Section2flagEntity, Section2permissionEntity,
      BlockEntity, Block4stringEntity, Block2flagEntity, Block4pointEntity, Block2permissionEntity, Block2permissionEntity,
      UserEntity, GroupEntity,
      PropertyEntity,
      LangEntity,
    ]),
  ],
  providers: [
  ],
  controllers: [ BlockController, ElementController, SectionController ],
})
export class ContentModule {
}
