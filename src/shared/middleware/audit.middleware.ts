import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MongoService } from '../infrastructure/mongodb/mongo.service';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditMiddleware.name);

  constructor(private readonly mongoService: MongoService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const timestamp = new Date();
    const method = req.method;
    const url = req.url;

    // Clona body, query e params para evitar mutações durante o processamento da requisição
    const body = req.body ? JSON.parse(JSON.stringify(req.body)) : {};
    const query = req.query ? JSON.parse(JSON.stringify(req.query)) : {};
    const params = req.params ? JSON.parse(JSON.stringify(req.params)) : {};

    res.on('finish', () => {
      const statusCode = res.statusCode;
      const user = (req as any).user;
      const userId = user?.sub ?? user?.id ?? null;
      const nickname = user?.login ?? user?.nickname ?? null;

      const payload = this.sanitizePayload({
        body,
        query,
        params,
      });

      const auditLog = {
        userId,
        nickname,
        endpoint: url,
        method,
        payload,
        statusCode,
        timestamp,
      };

      void this.mongoService.insertLog('audit_logs', auditLog);
    });

    next();
  }

  private sanitizePayload(payload: any): any {
    if (!payload || typeof payload !== 'object') {
      return payload;
    }
    const sanitized = Array.isArray(payload) ? [...payload] : { ...payload };
    const keysToRedact = ['password', 'token', 'jwt', 'accesstoken', 'refreshtoken', 'secret'];
    for (const key of Object.keys(sanitized)) {
      if (keysToRedact.includes(key.toLowerCase())) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizePayload(sanitized[key]);
      }
    }
    return sanitized;
  }
}
