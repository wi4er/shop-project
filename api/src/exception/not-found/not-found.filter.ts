import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { NoDataException } from './no-data.exception';

@Catch(NoDataException)
export class NotFoundFilter<T> implements ExceptionFilter {

  catch(exception: T, host: ArgumentsHost) {
    console.log(exception);
  }

}
