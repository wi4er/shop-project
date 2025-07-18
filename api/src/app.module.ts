import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PersonalModule } from './personal/personal.module';
import { ContentModule } from './content/content.module';
import { StorageModule } from './storage/storage.module';
import { RegistryModule } from './registry/registry.module';
import { CommonModule } from './common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createConnectionOptions } from './createConnectionOptions';
import { FeedbackModule } from './feedback/feedback.module';
import { ExceptionModule } from './exception/exception.module';
import * as cors from 'cors';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { WrongDataFilter } from './exception/wrong-data/wrong-data.filter';
import { SettingsModule } from './settings/settings.module';
import { DocumentModule } from './bundle/document.module';
import { ReportModule } from './report/report.module';
import { NoDataFilter } from './exception/no-data/no-data.filter';
import redisPermission from './permission/redis.permission';
import { PermissionFilter } from './exception/permission/permission.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as process from 'process';
import { CheckIdGuard } from './common/guard/check-id.guard';
import { CheckAccessGuard } from './personal/guard/check-access.guard';
import { CheckPermissionGuard } from './personal/guard/check-permission.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot(createConnectionOptions()),
    PersonalModule,
    ContentModule,
    StorageModule,
    RegistryModule,
    CommonModule,
    FeedbackModule,
    ExceptionModule,
    SettingsModule,
    DocumentModule,
    ReportModule,
    ServeStaticModule.forRoot({
      rootPath: process.env.STORAGE_PATH,
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: WrongDataFilter,
    },
    {
      provide: APP_FILTER,
      useClass: NoDataFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PermissionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: CheckIdGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CheckAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CheckPermissionGuard,
    },
  ],
})
export class AppModule {

  /**
   *
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(redisPermission())
      .forRoutes('/');

    consumer
      .apply(cors({
        credentials: true,
        origin: true,
      }))
      .forRoutes('/');
  }

}
