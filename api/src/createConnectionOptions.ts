import { UserEntity } from './personal/model/user/user.entity';
import { User4stringEntity } from './personal/model/user/user4string.entity';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { DirectoryEntity } from './registry/model/directory/directory.entity';
import { Directory4stringEntity } from './registry/model/directory/directory4string.entity';
import { GroupEntity } from './personal/model/group/group.entity';
import { PointEntity } from './registry/model/point/point.entity';
import { User2flagEntity } from './personal/model/user/user2flag.entity';
import { User4pointEntity } from './personal/model/user/user4point.entity';
import { User4userEntity } from './personal/model/user/user4user.entity';
import { User4descriptionEntity } from './personal/model/user/user4description.entity';
import { Point4stringEntity } from './registry/model/point/point4string.entity';
import { ElementEntity } from './content/model/element/element.entity';
import { Element2sectionEntity } from './content/model/element/element2section.entity';
import { SectionEntity } from './content/model/section/section.entity';
import { Element4stringEntity } from './content/model/element/element4string.entity';
import { BlockEntity } from './content/model/block/block.entity';
import { Block4stringEntity } from './content/model/block/block4string.entity';
import { Element4pointEntity } from './content/model/element/element4point.entity';
import { Section4pointEntity } from './content/model/section/section4point.entity';
import { Section4stringEntity } from './content/model/section/section4string.entity';
import { Element4elementEntity } from './content/model/element/element4element.entity';
import { Directory2flagEntity } from './registry/model/directory/directory2flag.entity';
import { Point2flagEntity } from './registry/model/point/point2flag.entity';
import { ContactEntity } from './personal/model/contact/contact.entity';
import { User2contactEntity } from './personal/model/user/user2contact.entity';
import { Contact2flagEntity } from './personal/model/contact/contact2flag.entity';
import { Contact4stringEntity } from './personal/model/contact/contact4string.entity';
import { Group4stringEntity } from './personal/model/group/group4string.entity';
import { Group2flagEntity } from './personal/model/group/group2flag.entity';
import { User2groupEntity } from './personal/model/user/user2group.entity';
import { Element2flagEntity } from './content/model/element/element2flag.entity';
import { Section2flagEntity } from './content/model/section/section2flag.entity';
import { Block2flagEntity } from './content/model/block/block2flag.entity';
import { Block2permissionEntity } from './content/model/block/block2permission.entity';
import { Block4pointEntity } from './content/model/block/block4point.entity';
import { Directory4pointEntity } from './registry/model/directory/directory4point.entity';
import { Point4pointEntity } from './registry/model/point/point4point.entity';
import { FormEntity } from './feedback/model/form/form.entity';
import { Form2flagEntity } from './feedback/model/form/form2flag.entity';
import { Form2fieldEntity } from './feedback/model/form/form2field.entity';
import { Form4stringEntity } from './feedback/model/form/form4string.entity';
import { Form4pointEntity } from './feedback/model/form/form4point.entity';
import { ResultEntity } from './feedback/model/result/result.entity';
import { AttributeEntity } from './settings/model/attribute/attribute.entity';
import { Attribute4stringEntity } from './settings/model/attribute/attribute4string.entity';
import { Attribute2flagEntity } from './settings/model/attribute/attribute2flag.entity';
import { FlagEntity } from './settings/model/flag/flag.entity';
import { Flag4stringEntity } from './settings/model/flag/flag4string.entity';
import { Flag2flagEntity } from './settings/model/flag/flag2flag.entity';
import { LangEntity } from './settings/model/lang/lang.entity';
import { Lang4stringEntity } from './settings/model/lang/lang4string.entity';
import { Lang2flagEntity } from './settings/model/lang/lang2flag.entity';
import { DocumentEntity } from './bundle/model/document/document.entity';
import { Document4stringEntity } from './bundle/model/document/document4string.entity';
import { Document2flagEntity } from './bundle/model/document/document2flag.entity';
import { Element2permissionEntity } from './content/model/element/element2permission.entity';
import { Section2permissionEntity } from './content/model/section/section2permission.entity';
import { Element4sectionEntity } from './content/model/element/element4section.entity';
import { User4groupEntity } from './personal/model/user/user4group.entity';
import { FileEntity } from './storage/model/file/file.entity';
import { CollectionEntity } from './storage/model/collection/collection.entity';
import { File2flagEntity } from './storage/model/file/file2flag.entity';
import { File4stringEntity } from './storage/model/file/file4string.entity';
import { Collection2flagEntity } from './storage/model/collection/collection2flag.entity';
import { Collection4stringEntity } from './storage/model/collection/collection4string.entity';
import { Element2imageEntity } from './content/model/element/element2image.entity';
import { Element4fileEntity } from './content/model/element/element4file.entity';
import { Section4fileEntity } from './content/model/section/section4file.entity';
import { Section2imageEntity } from './content/model/section/section2image.entity';
import { Block4fileEntity } from './content/model/block/block4file.entity';
import { User2imageEntity } from './personal/model/user/user2image.entity';
import { ConfigurationEntity } from './settings/model/configuration/configuration.entity';
import { AttributeAsPointEntity } from './settings/model/attribute/attribute-as-point.entity';
import { AttributeAsSectionEntity } from './settings/model/attribute/attribute-as-section.entity';
import { AttributeAsElementEntity } from './settings/model/attribute/attribute-as-element.entity';
import { AttributeAsFileEntity } from './settings/model/attribute/attribute-as-file.entity';
import { Directory2permissionEntity } from './registry/model/directory/directory2permission.entity';
import { AccessEntity } from './personal/model/access/access.entity';
import { Point2logEntity } from './registry/model/point/point2log.entity';
import { Directory2logEntity } from './registry/model/directory/directory2log.entity';
import { InstanceEntity } from './bundle/model/instance/instance.entity';
import { Element4IntervalEntity } from './content/model/element/element4interval.entity';
import { Element4counterEntity } from './content/model/element/element4counter.entity';
import { Element4InstanceEntity } from './content/model/element/element4instance.entity';
import { Block4descriptionEntity } from './content/model/block/block4description.entity';
import { Element4descriptionEntity } from './content/model/element/element4description.entity';
import { AttributeAsInstanceEntity } from './settings/model/attribute/attribute-as-instance.entity';
import { FieldEntity } from './settings/model/field/field.entity';
import { Field2flagEntity } from './settings/model/field/field2flag.entity';
import { Field4stringEntity } from './settings/model/field/field4string.entity';
import { FieldAsStringEntity } from './settings/model/field/field-as-string.entity';
import { FieldAsPointEntity } from './settings/model/field/field-as-point.entity';
import { FieldAsElementEntity } from './settings/model/field/field-as-element.entity';
import { FieldAsSectionEntity } from './settings/model/field/field-as-section.entity';
import { FieldAsFileEntity } from './settings/model/field/field-as-file.entity';

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
      AttributeEntity, Attribute4stringEntity, Attribute2flagEntity,
      AttributeAsPointEntity, AttributeAsSectionEntity, AttributeAsElementEntity, AttributeAsFileEntity, AttributeAsInstanceEntity,
      ConfigurationEntity,
      AccessEntity,
      DirectoryEntity,
      Directory4stringEntity, Directory4pointEntity,
      Directory2flagEntity, Directory2permissionEntity, Directory2logEntity,
      PointEntity,
      Point2flagEntity, Point2logEntity,
      Point4stringEntity, Point4pointEntity,
      FlagEntity, Flag4stringEntity, Flag2flagEntity,
      FieldEntity,
      Field2flagEntity,
      Field4stringEntity,
      FieldAsStringEntity, FieldAsPointEntity, FieldAsElementEntity, FieldAsSectionEntity, FieldAsFileEntity,
      LangEntity, Lang4stringEntity, Lang2flagEntity,
      ElementEntity, Element2flagEntity, Element2sectionEntity, Element2imageEntity,
      Element4elementEntity, Element4sectionEntity, Element4stringEntity, Element4pointEntity, Element4fileEntity,
      Element4IntervalEntity, Element4counterEntity, Element4InstanceEntity, Element4descriptionEntity,
      Element2permissionEntity,
      SectionEntity, Section2flagEntity, Section2permissionEntity, Section2imageEntity,
      Section4fileEntity, Section4pointEntity, Section4stringEntity,
      BlockEntity,
      Block4stringEntity, Block4pointEntity, Block4fileEntity, Block4descriptionEntity,
      Block2permissionEntity, Block2flagEntity,
      FormEntity,
      Form2flagEntity, Form2fieldEntity,
      Form4stringEntity, Form4pointEntity,
      ResultEntity,
      DocumentEntity, Document2flagEntity, Document4stringEntity,
      InstanceEntity,
      FileEntity, File2flagEntity, File4stringEntity,
      CollectionEntity, Collection2flagEntity, Collection4stringEntity,
    ],
    subscribers: [],
    migrations: [],
  };
}