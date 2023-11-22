import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from '../property/model/property.entity';
import { Property2stringEntity } from '../property/model/property2string.entity';
import { Property2flagEntity } from '../property/model/property2flag.entity';
import { LangEntity } from '../lang/model/lang.entity';
import { PropertyService } from '../property/service/property/property.service';
import { PropertyController } from '../property/controller/property/property.controller';
import { LangController } from './controller/lang/lang.controller';
import { LangService } from '../lang/service/lang/lang.service';
import { Lang2stringEntity } from '../lang/model/lang2string.entity';
import { Lang2flagEntity } from '../lang/model/lang2flag.entity';
import { FlagEntity } from '../flag/model/flag.entity';
import { Flag2flagEntity } from '../flag/model/flag2flag.entity';
import { Flag2stringEntity } from '../flag/model/flag2string.entity';
import { FlagService } from '../flag/service/flag/flag.service';
import { FlagController } from '../flag/controller/flag/flag.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyEntity, Property2stringEntity, Property2flagEntity,
      LangEntity, Lang2stringEntity, Lang2flagEntity,
      FlagEntity, Flag2flagEntity, Flag2stringEntity,
    ]),
  ],
  providers: [
    PropertyService,
    LangService,
    FlagService,
  ],
  controllers: [
    PropertyController,
    LangController,
    FlagController,
  ],
})
export class SettingsModule {
}
