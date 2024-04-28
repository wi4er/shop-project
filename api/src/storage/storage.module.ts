import { Module } from '@nestjs/common';
import { FileController } from './controller/file/file.controller';
import { UploadController } from './controller/upload/upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './model/file.entity';
import { CollectionEntity } from './model/collection.entity';
import { File2flagEntity } from './model/file2flag.entity';
import { File4stringEntity } from './model/file4string.entity';
import { Collection2flagEntity } from './model/collection2flag.entity';
import { Collection4stringEntity } from './model/collection4string.entity';
import { CollectionController } from './controller/collection/collection.controller';
import { FileNameService } from './service/file-name/file-name.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FileEntity, File2flagEntity,
      File4stringEntity,
      CollectionEntity, Collection2flagEntity,
      Collection4stringEntity,
    ]),
  ],
  controllers: [
    FileController,
    UploadController,
    CollectionController,
  ],
  providers: [FileNameService],
})
export class StorageModule {
}
