import { UserEntity } from './user/model/user.entity';
import { User4stringEntity } from './user/model/user4string.entity';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { DirectoryEntity } from './directory/model/directory.entity';
import { Directory4stringEntity } from './directory/model/directory4string.entity';
import { UserGroupEntity } from './user/model/user-group.entity';
import { PointEntity } from './directory/model/point.entity';
import { User2flagEntity } from './user/model/user2flag.entity';
import { User4pointEntity } from './user/model/user4point.entity';
import { User4userEntity } from './user/model/user4user.entity';
import { User4descriptionEntity } from './user/model/user4description.entity';
import { Point4stringEntity } from './directory/model/point4string.entity';
import { ElementEntity } from './content/model/element.entity';
import { Element2sectionEntity } from './content/model/element2section.entity';
import { SectionEntity } from './content/model/section.entity';
import { Element4stringEntity } from './content/model/element4string.entity';
import { BlockEntity } from './content/model/block.entity';
import { Block4stringEntity } from './content/model/block4string.entity';
import { Element4pointEntity } from './content/model/element4point.entity';
import { Section4pointEntity } from './content/model/section4point.entity';
import { Section4stringEntity } from './content/model/section4string.entity';
import { Element4elementEntity } from './content/model/element4element.entity';
import { Directory2flagEntity } from './directory/model/directory2flag.entity';
import { Point2flagEntity } from './directory/model/point2flag.entity';
import { UserContactEntity } from './user/model/user-contact.entity';
import { User2userContactEntity } from './user/model/user2user-contact.entity';
import { UserContact2flagEntity } from './user/model/user-contact2flag.entity';
import { UserContact4stringEntity } from './user/model/user-contact4string.entity';
import { UserGroup4stringEntity } from './user/model/user-group4string.entity';
import { UserGroup2flagEntity } from './user/model/user-group2flag.entity';
import { User2userGroupEntity } from './user/model/user2user-group.entity';
import { Element2flagEntity } from './content/model/element2flag.entity';
import { Section2flagEntity } from './content/model/section2flag.entity';
import { Block2flagEntity } from './content/model/block2flag.entity';
import { BlockPermissionEntity } from './content/model/block-permission.entity';
import { Block4pointEntity } from './content/model/block4point.entity';
import { Directory4pointEntity } from './directory/model/directory4point.entity';
import { Point4pointEntity } from './directory/model/point4point.entity';
import { FormEntity } from './form/model/form.entity';
import { Form2flagEntity } from './form/model/form2flag.entity';
import { Form4stringEntity } from './form/model/form4string.entity';
import { FormFieldStringEntity } from './form/model/form-field-string.entity';
import { FormFieldEntity } from './form/model/form-field.entity';
import { FormField2flagEntity } from './form/model/form-field2flag.entity';
import { FormField4stringEntity } from './form/model/form-field4string.entity';
import { FormFieldElementEntity } from './form/model/form-field-element.entity';
import { FormFieldSectionEntity } from './form/model/form-field-section.entity';
import { FormFieldDirectoryEntity } from './form/model/form-field-directory.entity';
import { ResultEntity } from './form/model/result.entity';
import { PropertyEntity } from './settings/model/property.entity';
import { Property4stringEntity } from './settings/model/property4string.entity';
import { Property2flagEntity } from './settings/model/property2flag.entity';
import { FlagEntity } from './settings/model/flag.entity';
import { Flag4stringEntity } from './settings/model/flag4string.entity';
import { Flag2flagEntity } from './settings/model/flag2flag.entity';
import { LangEntity } from './settings/model/lang.entity';
import { Lang4stringEntity } from './settings/model/lang4string.entity';
import { Lang2flagEntity } from './settings/model/lang2flag.entity';
import { DocumentEntity } from './document/model/document.entity';
import { Document4stringEntity } from './document/model/document4string.entity';
import { Document2flagEntity } from './document/model/document2flag.entity';
import { ElementPermissionEntity } from './content/model/element-permission.entity';
import { SectionPermissionEntity } from './content/model/section-permission.entity';
import { Element4sectionEntity } from './content/model/element4section.entity';

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
      UserEntity, User4stringEntity, User2flagEntity, User4pointEntity, User4userEntity, User4descriptionEntity,
      User2userContactEntity, User2userGroupEntity,
      UserContactEntity, UserContact4stringEntity, UserContact2flagEntity,
      UserGroupEntity, UserGroup4stringEntity, UserGroup2flagEntity,
      PropertyEntity, Property4stringEntity, Property2flagEntity,
      DirectoryEntity, Directory4stringEntity, Directory2flagEntity, Directory4pointEntity,
      PointEntity, Point4stringEntity, Point2flagEntity, Point4pointEntity,
      FlagEntity, Flag4stringEntity, Flag2flagEntity,
      LangEntity, Lang4stringEntity, Lang2flagEntity,
      ElementEntity, Element2flagEntity, Element2sectionEntity,
      Element4elementEntity, Element4sectionEntity, Element4stringEntity, Element4pointEntity,
      ElementPermissionEntity,
      SectionEntity, Section4pointEntity, Section4stringEntity, Section2flagEntity, SectionPermissionEntity,
      BlockEntity, Block4stringEntity, Block2flagEntity, Block4pointEntity, BlockPermissionEntity,
      FormEntity, Form2flagEntity, Form4stringEntity,
      FormFieldEntity, FormField2flagEntity, FormField4stringEntity,
      FormFieldStringEntity, FormFieldElementEntity, FormFieldSectionEntity, FormFieldDirectoryEntity,
      ResultEntity,
      DocumentEntity, Document2flagEntity, Document4stringEntity,
    ],
    subscribers: [],
    migrations: [],
  };
}