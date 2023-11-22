import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./model/user.entity";
import { User2stringEntity } from "./model/user2string.entity";
import { PropertyEntity } from "../property/model/property.entity";
import { UserService } from './service/user/user.service';
import { EncodeService } from "./service/encode/encode.service";
import { Property2stringEntity } from "../property/model/property2string.entity";
import { User2userEntity } from "./model/user2user.entity";
import { User2pointEntity } from "./model/user2point.entity";
import { User2flagEntity } from "./model/user2flag.entity";
import { UserController } from './controller/user/user.controller';
import { AuthController } from './controller/auth/auth.controller';
import { SessionService } from './service/session/session.service';
import { ForgotController } from './controller/forgot/forgot.controller';
import { UserContactEntity } from "./model/user-contact.entity";
import { User2userContactEntity } from "./model/user2user-contact.entity";
import { UserContact2flagEntity } from "./model/user-contact2flag.entity";
import { UserContact2stringEntity } from "./model/user-contact2string.entity";
import { LangEntity } from "../lang/model/lang.entity";
import { User2userGroupEntity } from "./model/user2user-group.entity";
import { UserGroupEntity } from "./model/user-group.entity";
import { UserGroup2stringEntity } from "./model/user-group2string.entity";
import { UserGroup2flagEntity } from "./model/user-group2flag.entity";
import { FlagEntity } from "../flag/model/flag.entity";
import { PointEntity } from "../directory/model/point.entity";
import { User2descriptionEntity } from "./model/user2description.entity";
import { MyselfController } from './controller/myself/myself.controller';
import { GroupController } from './controller/group/group.controller';
import { ContactController } from './controller/contact/contact.controller';
import { ContactService } from './service/contact/contact.service';
import { GroupService } from './service/group/group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity, User2stringEntity, User2userEntity, User2pointEntity, User2flagEntity,
      User2userContactEntity, User2userGroupEntity, User2descriptionEntity,
      UserGroupEntity, UserGroup2stringEntity, UserGroup2flagEntity,
      UserContactEntity, UserContact2flagEntity, UserContact2stringEntity,
      PropertyEntity, Property2stringEntity,
      LangEntity, FlagEntity,
      PointEntity,
    ])
  ],
  providers: [
    EncodeService,
    UserService,
    SessionService,
    ContactService,
    GroupService,
  ],
  controllers: [UserController, AuthController, ForgotController, MyselfController, GroupController, ContactController]
})
export class UserModule {
}
