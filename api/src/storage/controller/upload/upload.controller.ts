import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as process from 'process';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../../model/file.entity';
import { CollectionEntity } from '../../model/collection.entity';
import { FileCreateOperation } from '../../service/file-name/file-name.service';

@Controller('upload')
export class UploadController {

  constructor(
    @InjectRepository(FileEntity)
    private fileRepo: Repository<FileEntity>,
    @InjectRepository(CollectionEntity)
    private colRepo: Repository<CollectionEntity>,
  ) {
  }

  @Get(':file_name')
  getItem() {

    return '123';
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async postItem(
    @UploadedFile()
      file: Express.Multer.File,
    @Body()
      data: Object,
  ) {
    const saved = await new FileCreateOperation(process.env.STORAGE_PATH)
      .setFile(file.originalname)
      .checkDir()
      .then(it => it.createFile(file.buffer));

    const inst = new FileEntity();
    inst.mimetype = file.mimetype;
    inst.original = file.originalname;
    inst.path = saved.getPath();
    inst.collection = await this.colRepo.findOne({where: {id: data['collection']}});

    await inst.save();

    return {
      id: inst.id,
      created_at: inst.created_at,
      updated_at: inst.updated_at,
      version: inst.version,
      path: inst.path,
    };
  }

  // @Post(':file_id')
  // @UseInterceptors(FileInterceptor('file'))
  // postItem(
  //   @UploadedFile()
  //     file: Express.Multer.File,
  //   @Param('file_id')
  //     id: number,
  // ) {
  //
  //   console.log(id);
  //
  //   fs.writeFile(process.env.STORAGE_PATH + '/file.jpg', file.buffer)
  //     .then(res => console.log('WRITE'));
  //
  //
  //   return '123';
  // }

}
