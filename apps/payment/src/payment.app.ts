/**
 * @author Maytheu<maytheu98@gmail.com>
 * @description Implements the express server
 */
import { AppError, globalErrorHandler } from '@app/core';
import express, { Application, NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import router from './payment.route';
import path from 'path';
import { paymentValidate } from './payment.validation';
import { readFileSync } from 'fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';

class App {
  swaggerDir = paymentValidate.isDev
    ? path.join(__dirname, '../../../apps/payment/src/payment.swagger.yaml')
    : path.join(__dirname, 'payment.swagger.yaml');

  fileSync = readFileSync(this.swaggerDir, 'utf-8');
  swaggerDocument = YAML.parse(this.fileSync);

  app: Application;
  limiter = rateLimit({
    windowMs: 100 * 60 * 1000,
    max: 500,
    message: 'Too many request',
  });

  constructor() {
    this.app = express();

    this.middleware();
    this.route();
    this.errorHandler();
  }

  /**
   * Run all middleware
   */
  private middleware() {
    this.app.use(helmet());
    this.app.use(this.limiter);
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(ExpressMongoSanitize());
    this.app.use(hpp());
  }

  /**
   * Handle express route
   */
  private route() {
    this.app.use('/api/v1/payment', router);
    this.app.use(
      '/api/v1/payment/docs',
      swaggerUi.serve,
      swaggerUi.setup(this.swaggerDocument)
    );
  }

  /**
   * Handle global  error
   */
  private errorHandler() {
    //404 error on api
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      next(
        new AppError(`Ooops.. ${req.originalUrl} not found on this server`, 404)
      );
    });
    this.app.use(globalErrorHandler);
  }
}

export default new App();
