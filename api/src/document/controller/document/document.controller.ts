import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from '../../model/document.entity';
import { DocumentService } from '../../service/document/document.service';
import { DocumentInput } from '../../input/document.input';

@Controller('document')
export class DocumentController {

  relations = {
    string: {property: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectRepository(DocumentEntity)
    private docRepo: Repository<DocumentEntity>,
    private docService: DocumentService,
  ) {
  }

  toView(item: DocumentEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      property: [
        ...item.string.map(str => ({
          string: str.string,
          property: str.property.id,
          lang: str.lang?.id,
        })),
      ],
      flag: item.flag.map(fl => fl.flag.id),
    };
  }

  @Get()
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.docRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.docRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: number,
  ) {
    return this.docRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  async addItem(
    @Body()
      input: DocumentInput,
  ) {
    return this.docService.insert(input)
      .then(res => this.docRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

  @Put(':id')
  async updateItem(
    @Body()
      input: DocumentInput,
  ) {
    return this.docService.update(input)
      .then(res => this.docRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

}
