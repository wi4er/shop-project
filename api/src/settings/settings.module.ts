import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LangController } from './controller/lang/lang.controller';
import { PropertyEntity } from './model/property.entity';
import { Property4stringEntity } from './model/property4string.entity';
import { Property2flagEntity } from './model/property2flag.entity';
import { LangEntity } from './model/lang.entity';
import { Lang4stringEntity } from './model/lang4string.entity';
import { Lang2flagEntity } from './model/lang2flag.entity';
import { FlagEntity } from './model/flag.entity';
import { Flag2flagEntity } from './model/flag2flag.entity';
import { Flag4stringEntity } from './model/flag4string.entity';
import { PropertyController } from './controller/property/property.controller';
import { FlagController } from './controller/flag/flag.controller';
import { ConfigurationEntity } from './model/configuration.entity';
import { ConfigurationController } from './controller/configuration/configuration.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyEntity, Property4stringEntity, Property2flagEntity,
      LangEntity, Lang4stringEntity, Lang2flagEntity,
      FlagEntity, Flag2flagEntity, Flag4stringEntity,
      ConfigurationEntity,
    ]),
  ],
  providers: [
  ],
  controllers: [
    PropertyController,
    LangController,
    FlagController,
    ConfigurationController,
  ],
})
export class SettingsModule {
}
