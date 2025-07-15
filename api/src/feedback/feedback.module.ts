import { Module } from '@nestjs/common';
import { FormController } from './controller/form/form.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormEntity } from './model/form/form.entity';
import { Form2flagEntity } from './model/form/form2flag.entity';
import { Form4stringEntity } from './model/form/form4string.entity';
import { AttributeEntity } from '../settings/model/attribute/attribute.entity';
import { LangEntity } from '../settings/model/lang/lang.entity';
import { FlagEntity } from '../settings/model/flag/flag.entity';
import { ResultController } from './controller/result/result.controller';
import { ResultEntity } from './model/result/result.entity';
import { Form2fieldEntity } from './model/form/form2field.entity';
import { Form4pointEntity } from './model/form/form4point.entity';
import { FormLogController } from './controller/form-log/form-log.controller';
import { Form2logEntity } from './model/form/form2log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlagEntity,
      FormEntity,
      Form2flagEntity, Form2fieldEntity, Form2logEntity,
      Form4stringEntity, Form4pointEntity,
      ResultEntity,
      AttributeEntity,
      LangEntity,
    ]),
  ],
  controllers: [FormController, ResultController, FormLogController],
  providers: [],
})
export class FeedbackModule {
}
