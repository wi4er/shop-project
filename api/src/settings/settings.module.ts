import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LangController } from './controller/lang/lang.controller';
import { AttributeEntity } from './model/attribute/attribute.entity';
import { Attribute4stringEntity } from './model/attribute/attribute4string.entity';
import { Attribute2flagEntity } from './model/attribute/attribute2flag.entity';
import { LangEntity } from './model/lang/lang.entity';
import { Lang4stringEntity } from './model/lang/lang4string.entity';
import { Lang2flagEntity } from './model/lang/lang2flag.entity';
import { FlagEntity } from './model/flag/flag.entity';
import { Flag2flagEntity } from './model/flag/flag2flag.entity';
import { Flag4stringEntity } from './model/flag/flag4string.entity';
import { AttributeController } from './controller/attribute/attribute.controller';
import { FlagController } from './controller/flag/flag.controller';
import { ConfigurationEntity } from './model/configuration/configuration.entity';
import { ConfigurationController } from './controller/configuration/configuration.controller';
import { AttributeAsPointEntity } from './model/attribute/attribute-as-point.entity';
import { AttributeAsSectionEntity } from './model/attribute/attribute-as-section.entity';
import { AttributeAsElementEntity } from './model/attribute/attribute-as-element.entity';
import { AttributeAsFileEntity } from './model/attribute/attribute-as-file.entity';
import { AttributeAsInstanceEntity } from './model/attribute/attribute-as-instance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttributeEntity, Attribute4stringEntity, Attribute2flagEntity,
      AttributeAsPointEntity, AttributeAsSectionEntity, AttributeAsElementEntity, AttributeAsFileEntity, AttributeAsInstanceEntity,
      LangEntity, Lang4stringEntity, Lang2flagEntity,
      FlagEntity, Flag2flagEntity, Flag4stringEntity,
      ConfigurationEntity,
    ]),
  ],
  providers: [
  ],
  controllers: [
    AttributeController,
    LangController,
    FlagController,
    ConfigurationController,
  ],
})
export class SettingsModule {
}
