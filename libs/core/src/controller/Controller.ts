/**
 * @author Maytheu<maytheu98@gmail.com>
 * @description Base controller method for controller
 */

import { HttpStatus } from '@app/core';
import { Response } from 'express';

class Controller {
  /**
   * handle 200 response
   * @param res
   * @param message
   * @param data
   */
  protected sendResp(res: Response, message: string, data: object) {
    res.status(HttpStatus.HTTP_OK).json({ message, data });
  }

  /**
   * handle 201 response
   * @param res
   * @param message
   * @param data
   */
  protected sendCreatedResp(res: Response, message: string, data: object) {
    res.status(HttpStatus.HTTP_CREATED).json({ message, data });
  }

  /**
   * handle 204 response
   * @param res
   * @param message
   */
  protected sendDelResp(res: Response, message: string) {
    res.status(HttpStatus.HTTP_NO_CONTENT).json({ message });
  }
}

export default Controller;
