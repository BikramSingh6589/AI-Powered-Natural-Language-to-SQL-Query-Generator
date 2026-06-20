export class AppError extends Error {
  public status: number;
  public errors?: any[];

  constructor(message: string, status: number = 500, errors?: any[]) {
    super(message);
    this.status = status;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
