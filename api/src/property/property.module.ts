import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from './model/property.entity';
import { Property2stringEntity } from './model/property2string.entity';
import { Property2flagEntity } from './model/property2flag.entity';
import { LangEntity } from '../lang/model/lang.entity';
import { PropertyService } from './service/property/property.service';
import { PropertyController } from './controller/property/property.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyEntity, Property2stringEntity, Property2flagEntity,
      LangEntity,
    ]),
  ],
  providers: [
    PropertyService,
  ],
  controllers: [PropertyController],
})
export class PropertyModule {
}
