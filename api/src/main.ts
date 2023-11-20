import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WrongDataFilter } from './exception/wrong-data/wrong-data.filter';
import { NotFoundFilter } from './exception/not-found/not-found.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalFilters(new WrongDataFilter());
  // app.useGlobalFilters(new NotFoundFilter());

  await app.listen(3000);
}
bootstrap();
