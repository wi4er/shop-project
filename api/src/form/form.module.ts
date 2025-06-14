import { Module } from '@nestjs/common';
import { FormController } from './controller/form/form.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormEntity } from './model/form/form.entity';
import { Form2flagEntity } from './model/form/form2flag.entity';
import { Form4stringEntity } from './model/form/form4string.entity';
import { FormFieldStringEntity } from './model/form/form-field-string.entity';
import { FormFieldElementEntity } from './model/form/form-field-element.entity';
import { FormFieldSectionEntity } from './model/form/form-field-section.entity';
import { FormFieldDirectoryEntity } from './model/form/form-field-directory.entity';
import { AttributeEntity } from '../settings/model/attribute/attribute.entity';
import { LangEntity } from '../settings/model/lang/lang.entity';
import { FlagEntity } from '../settings/model/flag/flag.entity';
import { ResultController } from './controller/result/result.controller';
import { ResultEntity } from './model/result/result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlagEntity,
      FormEntity, Form2flagEntity, Form4stringEntity,
      FormFieldStringEntity, FormFieldElementEntity, FormFieldSectionEntity, FormFieldDirectoryEntity,
      ResultEntity,
      AttributeEntity,
      LangEntity,
    ]),
  ],
  controllers: [FormController, ResultController],
  providers: [],
})
export class FormModule {
}
