import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from "./user/user.module";
import { ContentModule } from "./content/content.module";
import { FileModule } from "./file/file.module";
import { PropertyModule } from "./property/property.module";
import { DirectoryModule } from "./directory/directory.module";
import { FlagModule } from "./flag/flag.module";
import { LangModule } from "./lang/lang.module";
import { CommonModule } from "./common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createConnectionOptions } from "./createConnectionOptions";

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
