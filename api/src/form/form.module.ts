import { Module } from '@nestjs/common';
import { FormController } from './controller/form/form.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from '../property/model/property.entity';
import { LangEntity } from '../lang/model/lang.entity';
import { FormEntity } from './model/form.entity';
import { Form2flagEntity } from './model/form2flag.entity';
import { Form2stringEntity } from './model/form2string.entity';
import { FormFieldStringEntity } from './model/form-field-string.entity';
import { FormFieldElementEntity } from './model/form-field-element.entity';
import { FormFieldSectionEntity } from './model/form-field-section.entity';
import { FormFieldDirectoryEntity } from './model/form-field-directory.entity';
import { FormService } from './service/form/form.service';
import { FlagEntity } from '../flag/model/flag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlagEntity, PropertyEntity,
      FormEntity, Form2flagEntity, Form2stringEntity,
      FormFieldStringEntity, FormFieldElementEntity, FormFieldSectionEntity, FormFieldDirectoryEntity,
      PropertyEntity, LangEntity,
    ]),
  ],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {
}
