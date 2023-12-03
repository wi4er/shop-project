import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { NoDataException } from './no-data.exception';
import { Response } from 'express';

@Catch(NoDataException)
export class NoDataFilter<T extends NoDataException> implements ExceptionFilter {

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response
      .status(404)
      .json({
        message: exception.message,
      });
  }

}
