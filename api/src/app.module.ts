import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PersonalModule } from './personal/personal.module';
import { ContentModule } from './content/content.module';
import { StorageModule } from './storage/storage.module';
import { DirectoryModule } from './directory/directory.module';
import { CommonModule } from './common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createConnectionOptions } from './createConnectionOptions';
import { FormModule } from './form/form.module';
import { ExceptionModule } from './exception/exception.module';
import * as cors from 'cors';
import { APP_FILTER } from '@nestjs/core';
import { WrongDataFilter } from './exception/wrong-data/wrong-data.filter';
import { SettingsModule } from './settings/settings.module';
import { DocumentModule } from './document/document.module';
import { ReportModule } from './report/report.module';
import { NoDataFilter } from './exception/no-data/no-data.filter';
import redisPermission from './permission/redis.permission';
import { PermissionFilter } from './exception/permission/permission.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as process from 'process';

@Module({
  imports: [
    TypeOrmModule.forRoot(createConnectionOptions()),
    PersonalModule,
    ContentModule,
    StorageModule,
    DirectoryModule,
    CommonModule,
    FormModule,
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
  ],
})
export class AppModule {
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
