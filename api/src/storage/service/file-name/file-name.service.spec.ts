import { Test, TestingModule } from '@nestjs/testing';
import { FileCreateOperation, FileNameService } from './file-name.service';

describe('FileNameService', () => {
  let service: FileNameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileNameService],
    }).compile();

    service = module.get<FileNameService>(FileNameService);
  });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });
  //
  // test('Should create hash', () => {
  //   const hash = service.createHash();
  //
  //   expect(hash).toHaveLength(10);
  // });
  //
  // test('Should create path', () => {
  //   const path = service.createPath('filename.jpg');
  //
  //   expect(path.dir).toHaveLength(3);
  //   expect(path.ext).toBe('.jpg');
  // });
  //
  // test('Should create file', async () => {
  //   await service.createFile(__dirname, {dir: '123', name: '333', ext: '.txt'});
  // });

  test('Should operate', async () => {
    const data = new Uint8Array([1, 2, 3])

    const oper = new FileCreateOperation(__dirname);
    await oper.setFile('filename.jpg')
      .checkDir()
      .then(it => it.createFile(data));
  });
});
