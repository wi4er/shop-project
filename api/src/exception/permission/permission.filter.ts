import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { PermissionException } from './permission.exception';

@Catch(PermissionException)
export class PermissionFilter<T extends PermissionException>
  implements ExceptionFilter {

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response
      .status(403)
      .json({
        message: exception.message,
      });
  }

}
