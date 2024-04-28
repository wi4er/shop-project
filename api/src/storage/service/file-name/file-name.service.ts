import { Injectable } from '@nestjs/common';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

export class FileCreateOperation {

  private dirName?: string;
  private fileName?: string;
  private ext?: string;

  constructor(
    private root: string,
  ) {
  }

  setFile(original: string) {
    this.ext = path.parse(original).ext;

    return this;
  }

  async checkDir() {
    const hash = this.createHash();
    this.dirName = hash.slice(0, 3);

    const dirPath = path.resolve(this.root, this.dirName);
    await fs.lstat(dirPath)
      .catch(err => fs.mkdir(dirPath));

    return this;
  }

  createHash(): string {
    return Math.random().toString(32).replace(/0|[.]/g, '');
  }

  async createFile(file: Uint8Array) {
    this.fileName = this.createHash();
    const filePath = path.resolve(this.root, this.dirName, this.fileName + this.ext)

    await fs.writeFile(filePath, file)
      .then(res => console.log('WRITE'));

    return this;
  }

  getPath() {
    return this.dirName + '/' + this.fileName + this.ext;
  }

}

@Injectable()
export class FileNameService {

}
