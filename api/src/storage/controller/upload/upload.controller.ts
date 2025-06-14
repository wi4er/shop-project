import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as process from 'process';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../../model/file/file.entity';
import { CollectionEntity } from '../../model/collection/collection.entity';
import { FileCreateOperation } from '../../service/file-name/file-name.service';

@Controller('upload')
export class UploadController {

  constructor(
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
  //   console.registry-log(id);
  //
  //   fs.writeFile(process.env.STORAGE_PATH + '/file.jpg', file.buffer)
  //     .then(res => console.registry-log('WRITE'));
  //
  //
  //   return '123';
  // }

}
