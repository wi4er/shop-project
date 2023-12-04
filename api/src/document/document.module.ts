import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from '../settings/model/property.entity';
import { LangEntity } from '../settings/model/lang.entity';
import { FlagEntity } from '../settings/model/flag.entity';
import { DocumentEntity } from './model/document.entity';
import { Document2flagEntity } from './model/document2flag.entity';
import { Document2stringEntity } from './model/document2string.entity';
import { DocumentController } from './controller/document/document.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentEntity, Document2flagEntity, Document2stringEntity,
      PropertyEntity,
      LangEntity,
      FlagEntity,
    ]),
  ],
  controllers: [DocumentController],
  providers: [],
})
export class DocumentModule {}
