import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeEntity } from '../settings/model/attribute.entity';
import { LangEntity } from '../settings/model/lang.entity';
import { FlagEntity } from '../settings/model/flag.entity';
import { DocumentEntity } from './model/document.entity';
import { Document2flagEntity } from './model/document2flag.entity';
import { Document4stringEntity } from './model/document4string.entity';
import { DocumentController } from './controller/document/document.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentEntity, Document2flagEntity, Document4stringEntity,
      AttributeEntity,
      LangEntity,
      FlagEntity,
    ]),
  ],
  controllers: [DocumentController],
  providers: [],
})
export class DocumentModule {}
