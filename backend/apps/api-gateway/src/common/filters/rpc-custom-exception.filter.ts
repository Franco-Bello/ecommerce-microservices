import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Si ya es una excepción HTTP normal del Gateway (ej. ValidationPipe o Guards)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return response.status(status).json(exception.getResponse());
    }

    // Si proviene de un Microservicio vía RpcException
    const rpcError = exception?.error || exception;

    if (typeof rpcError === 'object' && 'statusCode' in rpcError && 'message' in rpcError) {
      const status = isNaN(+rpcError.statusCode) ? HttpStatus.BAD_REQUEST : +rpcError.statusCode;
      return response.status(status).json(rpcError);
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: rpcError?.message || 'Error interno en la comunicación con el microservicio',
    });
  }
}