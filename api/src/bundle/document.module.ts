import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeEntity } from '../settings/model/attribute/attribute.entity';
import { LangEntity } from '../settings/model/lang/lang.entity';
import { FlagEntity } from '../settings/model/flag/flag.entity';
import { DocumentEntity } from './model/document/document.entity';
import { Document2flagEntity } from './model/document/document2flag.entity';
import { Document4stringEntity } from './model/document/document4string.entity';
import { DocumentController } from './controller/document/document.controller';
import { InstanceController } from './controller/instance/instance.controller';
import { InstanceEntity } from './model/instance/instance.entity';
import { Document2fieldEntity } from './model/document/document2field.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentEntity,
      Document2flagEntity, Document2fieldEntity,
      Document4stringEntity,
      InstanceEntity,
      AttributeEntity,
      LangEntity,
      FlagEntity,
    ]),
  ],
  controllers: [DocumentController, InstanceController],
  providers: [],
})
export class DocumentModule {}
