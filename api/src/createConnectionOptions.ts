import { UserEntity } from './user/model/user.entity';
import { User2stringEntity } from './user/model/user2string.entity';
import { PropertyEntity } from './property/model/property.entity';
import { Property2stringEntity } from './property/model/property2string.entity';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { DirectoryEntity } from './directory/model/directory.entity';
import { Directory2stringEntity } from './directory/model/directory2string.entity';
import { UserGroupEntity } from './user/model/user-group.entity';
import { PointEntity } from './directory/model/point.entity';
import { FlagEntity } from './flag/model/flag.entity';
import { Flag2flagEntity } from './flag/model/flag2flag.entity';
import { Flag2stringEntity } from './flag/model/flag2string.entity';
import { User2flagEntity } from './user/model/user2flag.entity';
import { User2pointEntity } from './user/model/user2point.entity';
import { User2userEntity } from './user/model/user2user.entity';
import { User2descriptionEntity } from './user/model/user2description.entity';
import { Point2stringEntity } from './directory/model/point2string.entity';
import { LangEntity } from './lang/model/lang.entity';
import { Lang2stringEntity } from './lang/model/lang2string.entity';
import { Lang2flagEntity } from './lang/model/lang2flag.entity';
import { ElementEntity } from './content/model/element.entity';
import { Element2sectionEntity } from './content/model/element2section.entity';
import { SectionEntity } from './content/model/section.entity';
import { Element2stringEntity } from './content/model/element2string.entity';
import { BlockEntity } from './content/model/block.entity';
import { Block2stringEntity } from './content/model/block2string.entity';
import { Element2pointEntity } from './content/model/element2point.entity';
import { Section2pointEntity } from './content/model/section2point.entity';
import { Section2stringEntity } from './content/model/section2string.entity';
import { Element2elementEntity } from './content/model/element2element.entity';
import { Directory2flagEntity } from './directory/model/directory2flag.entity';
import { Point2flagEntity } from './directory/model/point2flag.entity';
import { UserContactEntity } from './user/model/user-contact.entity';
import { User2userContactEntity } from './user/model/user2user-contact.entity';
import { UserContact2flagEntity } from './user/model/user-contact2flag.entity';
import { UserContact2stringEntity } from './user/model/user-contact2string.entity';
import { UserGroup2stringEntity } from './user/model/user-group2string.entity';
import { UserGroup2flagEntity } from './user/model/user-group2flag.entity';
import { User2userGroupEntity } from './user/model/user2user-group.entity';
import { Element2flagEntity } from './content/model/element2flag.entity';
import { Section2flagEntity } from './content/model/section2flag.entity';
import { Block2flagEntity } from './content/model/block2flag.entity';
import { Property2flagEntity } from './property/model/property2flag.entity';
import { BlockPermissionEntity } from './content/model/block-permission.entity';
import { Block2pointEntity } from './content/model/block2point.entity';
import { Directory2pointEntity } from './directory/model/directory2point.entity';
import { Point2pointEntity } from './directory/model/point2point.entity';
import { FormEntity } from './form/model/form.entity';
import { Form2flagEntity } from './form/model/form2flag.entity';
import { Form2stringEntity } from './form/model/form2string.entity';
import { FormFieldStringEntity } from './form/model/form-field-string.entity';
import { FormFieldEntity } from './form/model/form-field.entity';
import { FormField2flagEntity } from './form/model/form-field2flag.entity';
import { FormField2stringEntity } from './form/model/form-field2string.entity';
import { FormFieldElementEntity } from './form/model/form-field-element.entity';
import { FormFieldSectionEntity } from './form/model/form-field-section.entity';
import { FormFieldDirectoryEntity } from './form/model/form-field-directory.entity';

export function createConnectionOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: +process.env.DB_PORT || 5432,
    username: process.env.DB_USER_NAME || 'postgres',
    password: process.env.DB_USER_PASSWORD || 'example',
    database: process.env.DB_DATABASE || 'postgres',
    synchronize: true,
    logging: false,
    entities: [
      UserEntity, User2stringEntity, User2flagEntity, User2pointEntity, User2userEntity, User2descriptionEntity,
      User2userContactEntity, User2userGroupEntity,
      UserContactEntity, UserContact2stringEntity, UserContact2flagEntity,
      UserGroupEntity, UserGroup2stringEntity, UserGroup2flagEntity,
      PropertyEntity, Property2stringEntity, Property2flagEntity,
      DirectoryEntity, Directory2stringEntity, Directory2flagEntity, Directory2pointEntity,
      PointEntity, Point2stringEntity, Point2flagEntity, Point2pointEntity,
      FlagEntity, Flag2stringEntity, Flag2flagEntity,
      LangEntity, Lang2stringEntity, Lang2flagEntity,
      ElementEntity, Element2sectionEntity, Element2stringEntity, Element2pointEntity, Element2elementEntity, Element2flagEntity,
      SectionEntity, Section2pointEntity, Section2stringEntity, Section2flagEntity,
      BlockEntity, Block2stringEntity, Block2flagEntity, Block2pointEntity, BlockPermissionEntity,
      FormEntity, Form2flagEntity, Form2stringEntity,
      FormFieldEntity, FormField2flagEntity, FormField2stringEntity,
      FormFieldStringEntity, FormFieldElementEntity, FormFieldSectionEntity, FormFieldDirectoryEntity,
    ],
    subscribers: [],
    migrations: [],
  };
}