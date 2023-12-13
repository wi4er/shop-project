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
import { ContactEntity } from "./model/contact.entity";
import { User2contactEntity } from "./model/user2contact.entity";
import { Contact2flagEntity } from "./model/contact2flag.entity";
import { Contact4stringEntity } from "./model/contact4string.entity";
import { User2groupEntity } from "./model/user2group.entity";
import { GroupEntity } from "./model/group.entity";
import { Group4stringEntity } from "./model/group4string.entity";
import { Group2flagEntity } from "./model/group2flag.entity";
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
      User2contactEntity, User2groupEntity, User4descriptionEntity,
      GroupEntity, Group4stringEntity, Group2flagEntity,
      ContactEntity, Contact2flagEntity, Contact4stringEntity,
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
export class PersonalModule {
}
