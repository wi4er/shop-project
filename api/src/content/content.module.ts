import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElementEntity } from './model/element/element.entity';
import { Element2sectionEntity } from './model/element/element2section.entity';
import { SectionEntity } from './model/section/section.entity';
import { Element4stringEntity } from './model/element/element4string.entity';
import { BlockEntity } from './model/block/block.entity';
import { Block4stringEntity } from './model/block/block4string.entity';
import { Element4pointEntity } from './model/element/element4point.entity';
import { Section4pointEntity } from './model/section/section4point.entity';
import { Section4stringEntity } from './model/section/section4string.entity';
import { Element4elementEntity } from './model/element/element4element.entity';
import { BlockController } from './controller/block/block.controller';
import { ElementController } from './controller/element/element.controller';
import { Element2flagEntity } from './model/element/element2flag.entity';
import { SectionController } from './controller/section/section.controller';
import { Section2flagEntity } from './model/section/section2flag.entity';
import { Block2flagEntity } from './model/block/block2flag.entity';
import { Block2permissionEntity } from './model/block/block2permission.entity';
import { UserEntity } from '../personal/model/user/user.entity';
import { GroupEntity } from '../personal/model/group/group.entity';
import { Block4pointEntity } from './model/block/block4point.entity';
import { AttributeEntity } from '../settings/model/attribute/attribute.entity';
import { LangEntity } from '../settings/model/lang/lang.entity';
import { Element2permissionEntity } from './model/element/element2permission.entity';
import { Section2permissionEntity } from './model/section/section2permission.entity';
import { Element4sectionEntity } from './model/element/element4section.entity';
import { Element2imageEntity } from './model/element/element2image.entity';
import { Element4fileEntity } from './model/element/element4file.entity';
import { Section4fileEntity } from './model/section/section4file.entity';
import { Section2imageEntity } from './model/section/section2image.entity';
import { Block4fileEntity } from './model/block/block4file.entity';
import { Element4IntervalEntity } from './model/element/element4interval.entity';
import { Element4counterEntity } from './model/element/element4counter.entity';
import { Element4InstanceEntity } from './model/element/element4instance.entity';
import { Block4descriptionEntity } from './model/block/block4description.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ElementEntity, Element2sectionEntity, Element2flagEntity, Element2imageEntity,
      Element2permissionEntity,
      Element4stringEntity, Element4pointEntity, Element4elementEntity, Element4sectionEntity, Element4fileEntity,
      Element4IntervalEntity, Element4counterEntity, Element4InstanceEntity,
      SectionEntity,
      Section2flagEntity, Section2permissionEntity, Section2imageEntity,
      Section4pointEntity, Section4stringEntity, Section4fileEntity,
      BlockEntity,
      Block4stringEntity, Block4pointEntity, Block4fileEntity, Block4descriptionEntity,
      Block2permissionEntity, Block2flagEntity,
      Block2permissionEntity,
      UserEntity, GroupEntity,
      AttributeEntity,
      LangEntity,
    ]),
  ],
  providers: [],
  controllers: [BlockController, ElementController, SectionController],
})
export class ContentModule {
}
