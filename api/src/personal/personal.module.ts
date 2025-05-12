import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './model/user/user.entity';
import { User4stringEntity } from './model/user/user4string.entity';
import { EncodeService } from './service/encode/encode.service';
import { User4userEntity } from './model/user/user4user.entity';
import { User4pointEntity } from './model/user/user4point.entity';
import { User2flagEntity } from './model/user/user2flag.entity';
import { UserController } from './controller/user/user.controller';
import { AuthController } from './controller/auth/auth.controller';
import { SessionService } from './service/session/session.service';
import { ForgotController } from './controller/forgot/forgot.controller';
import { ContactEntity } from './model/contact/contact.entity';
import { User2contactEntity } from './model/user/user2contact.entity';
import { Contact2flagEntity } from './model/contact/contact2flag.entity';
import { Contact4stringEntity } from './model/contact/contact4string.entity';
import { User2groupEntity } from './model/user/user2group.entity';
import { GroupEntity } from './model/group/group.entity';
import { Group4stringEntity } from './model/group/group4string.entity';
import { Group2flagEntity } from './model/group/group2flag.entity';
import { PointEntity } from '../registry/model/point.entity';
import { User4descriptionEntity } from './model/user/user4description.entity';
import { MyselfController } from './controller/myself/myself.controller';
import { GroupController } from './controller/group/group.controller';
import { ContactController } from './controller/contact/contact.controller';
import { AttributeEntity } from '../settings/model/attribute.entity';
import { Attribute4stringEntity } from '../settings/model/attribute4string.entity';
import { LangEntity } from '../settings/model/lang.entity';
import { FlagEntity } from '../settings/model/flag.entity';
import { User2imageEntity } from './model/user/user2image.entity';
import { AccessEntity } from './model/access/access.entity';
import { Access2permissionEntity } from './model/access/access2permission.entity';
import { AccessController } from './controller/access/access.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccessEntity, Access2permissionEntity,
      UserEntity, User2flagEntity, User2contactEntity, User2groupEntity, User2imageEntity,
      User4stringEntity, User4userEntity, User4pointEntity, User4descriptionEntity,
      GroupEntity, Group4stringEntity, Group2flagEntity,
      ContactEntity, Contact2flagEntity, Contact4stringEntity,
      AttributeEntity, Attribute4stringEntity,
      LangEntity, FlagEntity,
      PointEntity,
    ]),
  ],
  providers: [
    EncodeService,
    SessionService,
  ],
  controllers: [
    UserController,
    AuthController,
    ForgotController,
    MyselfController,
    GroupController,
    ContactController,
    AccessController
  ],
})
export class PersonalModule {
}
