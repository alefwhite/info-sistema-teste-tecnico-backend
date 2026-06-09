import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { NotFoundDomainError } from '../domain/errors/not-found-domain.error';
import { ConflictDomainError } from '../domain/errors/conflict-domain.error';
import { BadRequestDomainError } from '../domain/errors/bad-request-domain.error';
import { UnauthorizedDomainError } from '../domain/errors/unauthorized-domain.error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof NotFoundDomainError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof ConflictDomainError) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
    } else if (exception instanceof BadRequestDomainError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof UnauthorizedDomainError) {
      status = HttpStatus.UNAUTHORIZED;
      message = exception.message;
    }

    const responseMessage =
      typeof message === 'string'
        ? message
        : ((message as { message?: string }).message ?? 'Error');

    response.status(status).json({
      message: responseMessage,
      statusCode: status,
    });
  }
}
