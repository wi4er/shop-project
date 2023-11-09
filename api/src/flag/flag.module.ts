import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlagEntity } from './model/flag.entity';
import { Flag2flagEntity } from './model/flag2flag.entity';
import { Flag2stringEntity } from './model/flag2string.entity';
import { PropertyEntity } from '../property/model/property.entity';
import { LangEntity } from '../lang/model/lang.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlagEntity, Flag2flagEntity, Flag2stringEntity,
      PropertyEntity,
      LangEntity,
    ]),
  ],
  providers: [],
})
export class FlagModule {
}
