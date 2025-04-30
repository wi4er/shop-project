import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LangController } from './controller/lang/lang.controller';
import { AttributeEntity } from './model/attribute.entity';
import { Attribute4stringEntity } from './model/attribute4string.entity';
import { Attribute2flagEntity } from './model/attribute2flag.entity';
import { LangEntity } from './model/lang.entity';
import { Lang4stringEntity } from './model/lang4string.entity';
import { Lang2flagEntity } from './model/lang2flag.entity';
import { FlagEntity } from './model/flag.entity';
import { Flag2flagEntity } from './model/flag2flag.entity';
import { Flag4stringEntity } from './model/flag4string.entity';
import { AttributeController } from './controller/attribute/attribute.controller';
import { FlagController } from './controller/flag/flag.controller';
import { ConfigurationEntity } from './model/configuration.entity';
import { ConfigurationController } from './controller/configuration/configuration.controller';
import { SettingsPermissionEntity } from './model/settings-permission.entity';
import { AttributeAsPointEntity } from './model/attribute-as-point.entity';
import { AttributeAsSectionEntity } from './model/attribute-as-section.entity';
import { AttributeAsElementEntity } from './model/attribute-as-element.entity';
import { AttributeAsFileEntity } from './model/attribute-as-file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttributeEntity, Attribute4stringEntity, Attribute2flagEntity,
      AttributeAsPointEntity, AttributeAsSectionEntity, AttributeAsElementEntity, AttributeAsFileEntity,
      LangEntity, Lang4stringEntity, Lang2flagEntity,
      FlagEntity, Flag2flagEntity, Flag4stringEntity,
      ConfigurationEntity,
      SettingsPermissionEntity,
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
