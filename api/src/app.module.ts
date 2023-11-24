import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ContentModule } from './content/content.module';
import { FileModule } from './file/file.module';
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

@Module({
  imports: [
    TypeOrmModule.forRoot(createConnectionOptions()),
    UserModule,
    ContentModule,
    FileModule,
    DirectoryModule,
    CommonModule,
    FormModule,
    ExceptionModule,
    SettingsModule,
    DocumentModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: WrongDataFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cors({
        credentials: true,
        origin: true,
      }))
      .forRoutes('/');
  }
}
