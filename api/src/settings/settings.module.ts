import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LangController } from './controller/lang/lang.controller';
import { PropertyEntity } from './model/property.entity';
import { Property2stringEntity } from './model/property2string.entity';
import { Property2flagEntity } from './model/property2flag.entity';
import { LangEntity } from './model/lang.entity';
import { Lang2stringEntity } from './model/lang2string.entity';
import { Lang2flagEntity } from './model/lang2flag.entity';
import { FlagEntity } from './model/flag.entity';
import { Flag2flagEntity } from './model/flag2flag.entity';
import { Flag2stringEntity } from './model/flag2string.entity';
import { PropertyController } from './controller/property/property.controller';
import { FlagController } from './controller/flag/flag.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyEntity, Property2stringEntity, Property2flagEntity,
      LangEntity, Lang2stringEntity, Lang2flagEntity,
      FlagEntity, Flag2flagEntity, Flag2stringEntity,
    ]),
  ],
  providers: [
  ],
  controllers: [
    PropertyController,
    LangController,
    FlagController,
  ],
})
export class SettingsModule {
}
