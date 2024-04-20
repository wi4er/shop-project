import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs/promises';
import * as process from 'process';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../../model/file.entity';

@Controller('upload')
export class UploadController {

  constructor(
    @InjectRepository(FileEntity)
    private fileRepo: Repository<FileEntity>,
  ) {
  }
  @Get(':file_name')
  getItem() {

    return '123';
  }

  @Post(':file_id')
  @UseInterceptors(FileInterceptor('file'))
  postItem(
    @UploadedFile()
      file: Express.Multer.File,
    @Param('file_id')
      id: number,
  ) {

    console.log(id);

    fs.writeFile(process.env.STORAGE_PATH + '/file.jpg', file.buffer)
      .then(res => console.log('WRITE'));


    return '123';
  }

}
