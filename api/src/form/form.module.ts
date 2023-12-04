import { Module } from '@nestjs/common';
import { FormController } from './controller/form/form.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormEntity } from './model/form.entity';
import { Form2flagEntity } from './model/form2flag.entity';
import { Form2stringEntity } from './model/form2string.entity';
import { FormFieldStringEntity } from './model/form-field-string.entity';
import { FormFieldElementEntity } from './model/form-field-element.entity';
import { FormFieldSectionEntity } from './model/form-field-section.entity';
import { FormFieldDirectoryEntity } from './model/form-field-directory.entity';
import { PropertyEntity } from '../settings/model/property.entity';
import { LangEntity } from '../settings/model/lang.entity';
import { FlagEntity } from '../settings/model/flag.entity';
import { ResultController } from './controller/result/result.controller';
import { ResultEntity } from './model/result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlagEntity,
      FormEntity, Form2flagEntity, Form2stringEntity,
      FormFieldStringEntity, FormFieldElementEntity, FormFieldSectionEntity, FormFieldDirectoryEntity,
      ResultEntity,
      PropertyEntity,
      LangEntity,
    ]),
  ],
  controllers: [FormController, ResultController],
  providers: [],
})
export class FormModule {
}
