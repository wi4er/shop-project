import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ContentModule } from './content/content.module';
import { FileModule } from './file/file.module';
import { PropertyModule } from './property/property.module';
import { DirectoryModule } from './directory/directory.module';
import { FlagModule } from './flag/flag.module';
import { LangModule } from './lang/lang.module';
import { CommonModule } from './common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createConnectionOptions } from './createConnectionOptions';
import { FormModule } from './form/form.module';
import { ExceptionModule } from './exception/exception.module';
import * as cors from 'cors';
import { APP_FILTER } from '@nestjs/core';
import { WrongDataFilter } from './exception/wrong-data/wrong-data.filter';

@Module({
  imports: [
    TypeOrmModule.forRoot(createConnectionOptions()),
    UserModule,
    ContentModule,
    FileModule,
    PropertyModule,
    DirectoryModule,
    FlagModule,
    LangModule,
    CommonModule,
    FormModule,
    ExceptionModule,
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
