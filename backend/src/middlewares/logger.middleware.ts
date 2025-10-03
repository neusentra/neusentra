import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { v4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.headers['uniqueId'] = v4();
    if (!req.headers['Authorization']) req.headers['uniqueId'] += '-guest';

    next();
  }
}
