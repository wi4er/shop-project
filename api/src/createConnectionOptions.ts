import { UserEntity } from './personal/model/user.entity';
import { User4stringEntity } from './personal/model/user4string.entity';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { DirectoryEntity } from './directory/model/directory.entity';
import { Directory4stringEntity } from './directory/model/directory4string.entity';
import { GroupEntity } from './personal/model/group.entity';
import { PointEntity } from './directory/model/point.entity';
import { User2flagEntity } from './personal/model/user2flag.entity';
import { User4pointEntity } from './personal/model/user4point.entity';
import { User4userEntity } from './personal/model/user4user.entity';
import { User4descriptionEntity } from './personal/model/user4description.entity';
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
import { ContactEntity } from './personal/model/contact.entity';
import { User2contactEntity } from './personal/model/user2contact.entity';
import { Contact2flagEntity } from './personal/model/contact2flag.entity';
import { Contact4stringEntity } from './personal/model/contact4string.entity';
import { Group4stringEntity } from './personal/model/group4string.entity';
import { Group2flagEntity } from './personal/model/group2flag.entity';
import { User2groupEntity } from './personal/model/user2group.entity';
import { Element2flagEntity } from './content/model/element2flag.entity';
import { Section2flagEntity } from './content/model/section2flag.entity';
import { Block2flagEntity } from './content/model/block2flag.entity';
import { Block2permissionEntity } from './content/model/block2permission.entity';
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
import { Element2permissionEntity } from './content/model/element2permission.entity';
import { Section2permissionEntity } from './content/model/section2permission.entity';
import { Element4sectionEntity } from './content/model/element4section.entity';
import { User4groupEntity } from './personal/model/user4group.entity';
import { ContentPermissionEntity } from './content/model/content-permission.entity';
import { FileEntity } from './storage/model/file.entity';
import { CollectionEntity } from './storage/model/collection.entity';
import { File2flagEntity } from './storage/model/file2flag.entity';
import { File4stringEntity } from './storage/model/file4string.entity';
import { Collection2flagEntity } from './storage/model/collection2flag.entity';
import { Collection4stringEntity } from './storage/model/collection4string.entity';
import { Element2imageEntity } from './content/model/element2image.entity';
import { Element4fileEntity } from './content/model/element4file.entity';
import { Section4fileEntity } from './content/model/section4file.entity';
import { Section2imageEntity } from './content/model/section2image.entity';
import { Block4fileEntity } from './content/model/block4file.entity';
import { User2imageEntity } from './personal/model/user2image.entity';
import { ConfigurationEntity } from './settings/model/configuration.entity';

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
      UserEntity, User2flagEntity, User2contactEntity, User2groupEntity, User2imageEntity,
      User4stringEntity, User4pointEntity, User4userEntity, User4groupEntity, User4descriptionEntity,
      ContactEntity, Contact2flagEntity,
      Contact4stringEntity,
      GroupEntity, Group2flagEntity,
      Group4stringEntity,
      PropertyEntity, Property4stringEntity, Property2flagEntity,
      ConfigurationEntity,
      DirectoryEntity, Directory4stringEntity, Directory2flagEntity, Directory4pointEntity,
      PointEntity, Point4stringEntity, Point2flagEntity, Point4pointEntity,
      FlagEntity, Flag4stringEntity, Flag2flagEntity,
      LangEntity, Lang4stringEntity, Lang2flagEntity,
      ElementEntity, Element2flagEntity, Element2sectionEntity, Element2imageEntity,
      Element4elementEntity, Element4sectionEntity, Element4stringEntity, Element4pointEntity, Element4fileEntity,
      Element2permissionEntity,
      SectionEntity, Section2flagEntity, Section2permissionEntity, Section2imageEntity,
      Section4fileEntity, Section4pointEntity, Section4stringEntity,
      BlockEntity,
      Block4stringEntity, Block2flagEntity, Block4pointEntity, Block4fileEntity,
      Block2permissionEntity,
      ContentPermissionEntity,
      FormEntity, Form2flagEntity, Form4stringEntity,
      FormFieldEntity, FormField2flagEntity, FormField4stringEntity,
      FormFieldStringEntity, FormFieldElementEntity, FormFieldSectionEntity, FormFieldDirectoryEntity,
      ResultEntity,
      DocumentEntity, Document2flagEntity, Document4stringEntity,
      FileEntity, File2flagEntity, File4stringEntity,
      CollectionEntity, Collection2flagEntity, Collection4stringEntity,
    ],
    subscribers: [],
    migrations: [],
  };
}