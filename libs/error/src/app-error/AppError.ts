/**
 * @author Maytheu <maytheu98@gmail.com>
 * @description custom AppError handler
 * @param {null}
 * @returns {Null}
 */
class AppError extends Error {
    status!: string;
    statusCode!: number;
    code!: number | string;
    isOperational!: boolean;
    error: object;
  
    /**
     * @param {string} message a string containing values for your response
     * @param {number} statusCode containing your response status code
     * @param {object} error conraining your response data object
     */
  
    constructor(message: string, statusCode: number, error = {}) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.error = error;
  
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default AppError;
  