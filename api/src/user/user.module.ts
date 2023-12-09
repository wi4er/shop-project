import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./model/user.entity";
import { User4stringEntity } from "./model/user4string.entity";
import { EncodeService } from "./service/encode/encode.service";
import { User4userEntity } from "./model/user4user.entity";
import { User4pointEntity } from "./model/user4point.entity";
import { User2flagEntity } from "./model/user2flag.entity";
import { UserController } from './controller/user/user.controller';
import { AuthController } from './controller/auth/auth.controller';
import { SessionService } from './service/session/session.service';
import { ForgotController } from './controller/forgot/forgot.controller';
import { UserContactEntity } from "./model/user-contact.entity";
import { User2userContactEntity } from "./model/user2user-contact.entity";
import { UserContact2flagEntity } from "./model/user-contact2flag.entity";
import { UserContact4stringEntity } from "./model/user-contact4string.entity";
import { User2userGroupEntity } from "./model/user2user-group.entity";
import { UserGroupEntity } from "./model/user-group.entity";
import { UserGroup4stringEntity } from "./model/user-group4string.entity";
import { UserGroup2flagEntity } from "./model/user-group2flag.entity";
import { PointEntity } from "../directory/model/point.entity";
import { User4descriptionEntity } from "./model/user4description.entity";
import { MyselfController } from './controller/myself/myself.controller';
import { GroupController } from './controller/group/group.controller';
import { ContactController } from './controller/contact/contact.controller';
import { PropertyEntity } from '../settings/model/property.entity';
import { Property4stringEntity } from '../settings/model/property4string.entity';
import { LangEntity } from '../settings/model/lang.entity';
import { FlagEntity } from '../settings/model/flag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity, User4stringEntity, User4userEntity, User4pointEntity, User2flagEntity,
      User2userContactEntity, User2userGroupEntity, User4descriptionEntity,
      UserGroupEntity, UserGroup4stringEntity, UserGroup2flagEntity,
      UserContactEntity, UserContact2flagEntity, UserContact4stringEntity,
      PropertyEntity, Property4stringEntity,
      LangEntity, FlagEntity,
      PointEntity,
    ])
  ],
  providers: [
    EncodeService,
    SessionService,
  ],
  controllers: [UserController, AuthController, ForgotController, MyselfController, GroupController, ContactController]
})
export class UserModule {
}
