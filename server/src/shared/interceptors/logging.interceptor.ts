import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;

    const startTime = Date.now();

    // this.logger.log(
    //   `➡️  Incoming Request: ${method} ${url} | IP: ${ip} | User-Agent: ${userAgent}`
    // );

    this.logger.log(
      `➡️  Incoming Request: ${method} ${url} | IP: ${ip}`
    );

    // if (body && Object.keys(body).length > 0) {
    //   const sanitizedBody = this.sanitizeBody(body);
    //   this.logger.log(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    // }

    // if (query && Object.keys(query).length > 0) {
    //   this.logger.log(`Query Params: ${JSON.stringify(query)}`);
    // }

    // if (params && Object.keys(params).length > 0) {
    //   this.logger.log(`Route Params: ${JSON.stringify(params)}`);
    // }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logger.log(
            `⬅️  Response: ${method} ${url} | Status: ${statusCode} | Duration: ${duration}ms`
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error?.status || 500;
          this.logger.error(
            `❌ Error Response: ${method} ${url} | Status: ${statusCode} | Duration: ${duration}ms | Error: ${error?.message}`
          );
        },
      })
    );
  }

  private sanitizeBody(body: any): any {

    const sanitized = { ...body };

    const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}

