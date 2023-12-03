import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WrongDataFilter } from './exception/wrong-data/wrong-data.filter';
import { NoDataFilter } from './exception/no-data/no-data.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalFilters(new WrongDataFilter());
  // app.useGlobalFilters(new NoDataFilter());

  await app.listen(3000);
}
bootstrap();
