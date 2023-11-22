import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlagEntity } from './model/flag.entity';
import { Flag2flagEntity } from './model/flag2flag.entity';
import { Flag2stringEntity } from './model/flag2string.entity';
import { PropertyEntity } from '../property/model/property.entity';
import { LangEntity } from '../lang/model/lang.entity';
import { FlagController } from './controller/flag/flag.controller';
import { FlagService } from './service/flag/flag.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlagEntity, Flag2flagEntity, Flag2stringEntity,
      PropertyEntity,
      LangEntity,
    ]),
  ],
  providers: [FlagService],
  controllers: [FlagController],
})
export class FlagModule {
}
