import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { LangEntity } from "./model/lang.entity";
import { Lang2stringEntity } from "./model/lang2string.entity";
import { Lang2flagEntity } from "./model/lang2flag.entity";
import { PropertyEntity } from "../property/model/property.entity";
import { FlagEntity } from "../flag/model/flag.entity";
import { LangService } from './service/lang/lang.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LangEntity, Lang2stringEntity, Lang2flagEntity,
      PropertyEntity,
      FlagEntity,
    ])
  ],
  providers: [
    LangService,
  ],
  exports: [ LangService ]
})
export class LangModule {
}
