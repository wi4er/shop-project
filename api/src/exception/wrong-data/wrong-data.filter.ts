import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WrongDataException } from './wrong-data.exception';
import { Request, Response } from 'express';

@Catch(WrongDataException)
export class WrongDataFilter<T extends Error> implements ExceptionFilter {

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response
      .status(400)
      .json({
        message: exception.message,
      });
  }

}
